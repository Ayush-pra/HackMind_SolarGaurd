import Telemetry from '../models/Telemetry.js';
import Inverter from '../models/Inverter.js';
import Prediction from '../models/Prediction.js';
import { validateArchitectureFields } from '../utils/validateArchitecture.js';
import axios from 'axios';

// Global telemetry history: Map<inverterId (string), Array<telemetryObj>>
const telemetryHistory = new Map();

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

    // Update telemetry history
    if (!telemetryHistory.has(inverterId)) {
      telemetryHistory.set(inverterId, []);
    }
    const history = telemetryHistory.get(inverterId);
    history.push({
      timestamp: telemetry.createdAt,
      power: telemetry.outputPower,
      temp: telemetry.temperature,
      pvVoltages: telemetry.pvVoltages,
      pvCurrents: telemetry.pvCurrents,
      op_state: telemetry.opState,
      alarm_code: telemetry.alarmCode,
    });
    if (history.length > 288) {
      history.shift();
    }

    // Compute KPIs
    const features = computeKpis(history);

    // Call ML service
    let prediction = null;
    try {
      const mlResponse = await axios.post('http://localhost:8000/predict', { features });
      prediction = mlResponse.data;
    } catch (mlError) {
      console.error('ML service error:', mlError.message);
      // Continue without prediction
    }

    // Store prediction
    if (prediction) {
      await Prediction.findOneAndUpdate(
        { inverterId: inverter._id },
        {
          riskScore: prediction.risk_score,
          riskLevel: prediction.risk_class,
          estimatedDaysToEvent: 365, // Default
          riskTrend: 'stable', // Default
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );

      // Update inverter
      await Inverter.findByIdAndUpdate(inverter._id, {
        riskScore: prediction.risk_score,
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

// Compute KPIs from telemetry history
function computeKpis(history) {
  if (history.length === 0) return {};

  const n = data.length;
  let latestt = data[n - 1];

  const pvVoltageCols = Object.keys(latestt).filter(k => k.startsWith('pv_voltage_'));
  const pvCurrentCols = Object.keys(latestt).filter(k => k.startsWith('pv_current_'));

  // Build data rows
  const data = history.map(h => {
    const row = {
      timestamp: h.timestamp,
      power: h.power || 0,
      temp: h.temp || 0,
      op_state: h.op_state || '',
      alarm_code: h.alarm_code || null,
    };
    if (h.pvVoltages) {
      h.pvVoltages.forEach((v, i) => row[`pv_voltage_${i + 1}`] = v || 0);
    }
    if (h.pvCurrents) {
      h.pvCurrents.forEach((v, i) => row[`pv_current_${i + 1}`] = v || 0);
    }

    // Compute per row aggregates
    const pvVs = h.pvVoltages || [];
    const pvCs = h.pvCurrents || [];
    row.avg_pv_voltage = pvVs.length > 0 ? pvVs.reduce((a, b) => a + b, 0) / pvVs.length : 0;
    row.avg_pv_current = pvCs.length > 0 ? pvCs.reduce((a, b) => a + b, 0) / pvCs.length : 0;
    row.dc_power = row.avg_pv_voltage * row.avg_pv_current;
    row.efficiency = row.power / (row.dc_power + 1e-6);

    return row;
  });

  latestt = data[n - 1];

  // Power drop
  let power_drop = null;
  if (n >= 2) {
    const prevPower = data[n - 2].power;
    if (prevPower) {
      power_drop = (latestt.power - prevPower) / prevPower;
    }
  }

  // Power std 6h
  let power_std_6h = null;
  if (n >= 72) {
    const powers = data.slice(-72).map(d => d.power);
    const mean = powers.reduce((a, b) => a + b, 0) / powers.length;
    power_std_6h = Math.sqrt(powers.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / powers.length);
  }

  // Voltage dev
  let voltage_dev = null;
  if (latestt.avg_pv_voltage && n >= 288) {
    const voltages = data.slice(-288).map(d => d.avg_pv_voltage);
    const mean = voltages.reduce((a, b) => a + b, 0) / voltages.length;
    voltage_dev = Math.abs(latestt.avg_pv_voltage - mean);
  }

  // Current dev
  let current_dev = null;
  if (latestt.avg_pv_current && n >= 288) {
    const currents = data.slice(-288).map(d => d.avg_pv_current);
    const mean = currents.reduce((a, b) => a + b, 0) / currents.length;
    current_dev = Math.abs(latestt.avg_pv_current - mean);
  }

  // Imbalances (std of latestt)
  const current_imbalance = latestt.avg_pv_current ? Math.sqrt(
    pvCurrentCols.map(col => latestt[col]).reduce((sum, v) => sum + Math.pow(v - latestt.avg_pv_current, 2), 0) / pvCurrentCols.length
  ) : null;
  const voltage_imbalance = latestt.avg_pv_voltage ? Math.sqrt(
    pvVoltageCols.map(col => latestt[col]).reduce((sum, v) => sum + Math.pow(v - latestt.avg_pv_voltage, 2), 0) / pvVoltageCols.length
  ) : null;

  // Efficiency trend
  let efficiency_trend = null;
  if (n >= 288) {
    const efficiencies = data.slice(-288).map(d => d.efficiency);
    efficiency_trend = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
  }

  return {
    power: latestt.power,
    temp: latestt.temp,
    efficiency: latestt.efficiency,
    power_drop,
    voltage_dev,
    current_dev,
    current_imbalance,
    voltage_imbalance,
    power_std_6h,
    efficiency_trend,
    op_state: latestt.op_state,
  };
}

export { createTelemetry };
