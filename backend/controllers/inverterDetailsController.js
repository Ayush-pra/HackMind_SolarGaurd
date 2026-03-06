import Inverter from '../models/Inverter.js';
import Plant from '../models/Plant.js';
import Telemetry from '../models/Telemetry.js';
import Fault from '../models/Fault.js';
import Prediction from '../models/Prediction.js';

// GET /api/inverters/:inverterId
export const getInverterDetails = async (req, res, next) => {
  try {
    const { inverterId } = req.params;

    const inverter = await Inverter.findOne({ inverterId });
    if (!inverter) {
      return res.status(404).json({ message: `Inverter "${inverterId}" not found` });
    }

    const plant = await Plant.findById(inverter.plantId);
    const telemetry = await Telemetry.findOne({ inverterId: inverter._id }).sort({ createdAt: -1 });
    const faults = await Fault.find({ inverterId: inverter._id }).sort({ createdAt: -1 });
    const prediction = await Prediction.findOne({ inverterId: inverter._id }).sort({ createdAt: -1 });

    const riskScore = prediction?.riskScore ?? inverter.riskScore;
    const riskLevel = prediction?.riskLevel ?? inverter.riskLevel;

    res.json({
      id: inverter.inverterId,
      _id: inverter._id,
      plantId: inverter.plantId,
      model: inverter.model,
      riskScore,
      riskLabel: riskLevel,
      daysToEvent: prediction?.estimatedDaysToEvent ?? 365,
      riskTrend: prediction?.riskTrend ?? 'stable',
      operatingState: inverter.operatingState,

      // Telemetry values
      temperature: telemetry?.temperature ?? 0,
      output: telemetry?.outputPower ?? 0,
      efficiency: telemetry?.efficiency ?? 0,
      dcVoltage: telemetry ? Math.max(telemetry.voltageAB ?? 0, telemetry.voltageBC ?? 0, telemetry.voltageCA ?? 0) : 0,
      irradiance: telemetry?.irradiance ?? 0,
      stringImbalance: telemetry?.stringImbalance ?? 0,
      frequency: telemetry?.frequency ?? 0,
      voltageAB: telemetry?.voltageAB ?? 0,
      voltageBC: telemetry?.voltageBC ?? 0,
      voltageCA: telemetry?.voltageCA ?? 0,
      kwhToday: telemetry?.kwhToday ?? 0,
      kwhTotal: telemetry?.kwhTotal ?? 0,
      pvChannels: telemetry?.pvChannels ?? [],
      smuStrings: telemetry?.smuStrings ?? [],
      activeFaults: faults.length,

      // Plant info
      plant: plant
        ? {
            id: plant._id,
            name: plant.name,
            location: plant.location,
          }
        : null,

      // Faults list (matching frontend's mockFaults shape)
      faults: faults.map((f) => ({
        name: f.faultName,
        code: f.faultCode,
        severity: f.severity,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/inverter/:inverterId/risk-trend
export const getRiskTrend = async (req, res, next) => {
  try {
    const { inverterId } = req.params;

    const inverter = await Inverter.findOne({ inverterId });
    if (!inverter) {
      return res.status(404).json({ message: `Inverter "${inverterId}" not found` });
    }

    const prediction = await Prediction.findOne({ inverterId: inverter._id }).sort({ createdAt: -1 });

    // Return historical + forecast arrays; frontend expects { day, historical, predicted }
    res.json({
      historicalRisk: prediction?.historicalRisk ?? [],
      forecastRisk: prediction?.forecastRisk ?? [],
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/inverter/:inverterId/power-analysis
export const getPowerAnalysis = async (req, res, next) => {
  try {
    const { inverterId } = req.params;

    const inverter = await Inverter.findOne({ inverterId });
    if (!inverter) {
      return res.status(404).json({ message: `Inverter "${inverterId}" not found` });
    }

    const prediction = await Prediction.findOne({ inverterId: inverter._id }).sort({ createdAt: -1 });
    const plant = await Plant.findById(inverter.plantId);

    res.json({
      historicalPower: prediction?.historicalPower ?? [],
      forecastPower: prediction?.forecastPower ?? [],
      ratedCapacity: plant?.capacityMW ?? 0,
      outputDeficit: 0,
    });
  } catch (error) {
    next(error);
  }
};
