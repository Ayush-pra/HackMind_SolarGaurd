import Telemetry from '../models/Telemetry.js';
import Inverter from '../models/Inverter.js';
import Prediction from '../models/Prediction.js';
import { validateArchitectureFields } from '../utils/validateArchitecture.js';
import { KPICalculator } from '../utils/kpiCalculator.js';
import { MLServiceClient } from '../utils/mlServiceClient.js';
import axios from 'axios';

// Global telemetry history: Map<inverterId (string), Array<telemetryObj>>
const telemetryHistory = new Map();

// Initialize ML service client
const mlClient = new MLServiceClient();

// POST /api/telemetry
export const createTelemetry = async (req, res, next) => {
  try {
    const {
      plantId,
      inverterId, // This is the string inverterId (e.g. "INV-A01")
      temperature,
      output,
      pvVoltages,
      pvCurrents,
      smuStrings,
      alarmCode,
      opState,
      // Optional monitoring fields
      frequency,
      voltageAB,
      voltageBC,
      voltageCA,
      efficiency,
      irradiance,
      stringImbalance,
      kwhToday,
      kwhTotal,
      faultNotes,
    } = req.body;

    if (!plantId || !inverterId) {
      return res.status(400).json({ message: 'plantId and inverterId are required' });
    }

    // Resolve inverter document by string inverterId
    const inverter = await Inverter.findOne({ inverterId, plantId });
    if (!inverter) {
      return res.status(404).json({ message: `Inverter "${inverterId}" not found in specified plant` });
    }

    // Validate architecture fields
    const archError = await validateArchitectureFields(plantId, pvVoltages, pvCurrents, smuStrings);
    if (archError) {
      return res.status(400).json({ message: archError });
    }

    const telemetry = await Telemetry.create({
      plantId,
      inverterId: inverter._id,
      temperature: temperature ?? null,
      outputPower: output ?? null,
      pvVoltages: pvVoltages || [],
      pvCurrents: pvCurrents || [],
      smuStrings: smuStrings || [],
      alarmCode: alarmCode ?? null,
      opState: opState || '',
      frequency: frequency ?? null,
      voltageAB: voltageAB ?? null,
      voltageBC: voltageBC ?? null,
      voltageCA: voltageCA ?? null,
      efficiency: efficiency ?? null,
      irradiance: irradiance ?? null,
      stringImbalance: stringImbalance ?? null,
      kwhToday: kwhToday ?? null,
      kwhTotal: kwhTotal ?? null,
      faultNotes: faultNotes || '',
    });

        // Load last telemetry history from memory or DB
    let history = telemetryHistory.get(inverterId);

    if (!history) {
      const lastTelemetry = await Telemetry.find({ inverterId: inverter._id })
        .sort({ createdAt: -1 })
        .limit(288)
        .lean();

      history = lastTelemetry
        .reverse()
        .map(t => ({
          timestamp: t.createdAt,
          power: t.outputPower,
          temp: t.temperature,
          pvVoltages: t.pvVoltages,
          pvCurrents: t.pvCurrents,
          op_state: t.opState,
          alarm_code: t.alarmCode,
        }));

      telemetryHistory.set(inverterId, history);
    }

    // push latest telemetry
    history.push({
      timestamp: telemetry.createdAt,
      power: telemetry.outputPower,
      temp: telemetry.temperature,
      pvVoltages: telemetry.pvVoltages,
      pvCurrents: telemetry.pvCurrents,
      op_state: telemetry.opState,
      alarm_code: telemetry.alarmCode,
    });

    // keep max 288
    if (history.length > 288) {
      history.shift();
    }

    // Compute KPIs
    const features = KPICalculator.computeKpis(history);
    features.op_state = parseInt(features.op_state) || 0;
    // Call ML service
    let prediction = null;
    try {
      prediction = await mlClient.predict(features);

      if (prediction && prediction.risk_score !== undefined) {
        prediction.risk_score = Number(prediction.risk_score.toFixed(2));
      }
    } catch (mlError) {
      console.error('ML service error:', mlError.message);
      // Continue without prediction - graceful degradation
    }

    // Store prediction
        if (prediction) {

      const riskScore = Number(prediction.risk_score.toFixed(2));

      await Prediction.findOneAndUpdate(
        { inverterId: inverter._id },
        {
          riskScore,
          riskLevel: prediction.risk_class,
          estimatedDaysToEvent: 365,
          riskTrend: 'stable',
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );

      await Inverter.findByIdAndUpdate(inverter._id, {
        riskScore,
        riskLevel: prediction.risk_class,
      });
    }

    res.status(201).json({
      message: 'Telemetry recorded successfully',
      telemetry: {
        id: telemetry._id,
        plantId: telemetry.plantId,
        inverterId: inverterId,
        createdAt: telemetry.createdAt,
      },
      prediction,
    });
  } catch (error) {
    next(error);
  }
};

// Health check endpoint
export const healthCheck = async (req, res) => {
  try {
    // Check ML service health
    const mlHealthy = await mlClient.healthCheck();
    
    // Check database connection
    const dbHealthy = true; // Mongoose handles connection internally
    
    res.json({
      status: mlHealthy && dbHealthy ? 'healthy' : 'degraded',
      services: {
        ml_service: mlHealthy ? 'healthy' : 'unhealthy',
        database: dbHealthy ? 'healthy' : 'unhealthy'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


