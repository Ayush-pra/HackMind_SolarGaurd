import Inverter from '../models/Inverter.js';
import Plant from '../models/Plant.js';

// GET /api/plants/:plantId/inverters
export const getInvertersByPlant = async (req, res, next) => {
  try {
    const { plantId } = req.params;
    const inverters = await Inverter.find({ plantId }).sort({ createdAt: -1 });

    const result = inverters.map((inv) => ({
      id: inv.inverterId,
      _id: inv._id,
      plantId: inv.plantId,
      model: inv.model,
      riskScore: inv.riskScore,
      riskLabel: inv.riskLevel,
      operatingState: inv.operatingState,
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/inverters
export const createInverter = async (req, res, next) => {
  try {
    const { plantId, inverterId, model, operatingState } = req.body;

    if (!plantId || !inverterId || !model) {
      return res.status(400).json({ message: 'plantId, inverterId, and model are required' });
    }

    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    const existing = await Inverter.findOne({ inverterId });
    if (existing) {
      return res.status(409).json({ message: `Inverter "${inverterId}" already exists` });
    }

    const inverter = await Inverter.create({
      plantId,
      inverterId,
      model,
      operatingState: operatingState || 'Running',
    });

    res.status(201).json({
      id: inverter.inverterId,
      _id: inverter._id,
      plantId: inverter.plantId,
      model: inverter.model,
      riskScore: inverter.riskScore,
      riskLabel: inverter.riskLevel,
      operatingState: inverter.operatingState,
      temperature: 0,
      output: 0,
      efficiency: 0,
      activeFaults: 0,
      daysToEvent: 365,
      riskTrend: 'stable',
      dcVoltage: 0,
      irradiance: 0,
      stringImbalance: 0,
      frequency: 0,
      voltageAB: 0,
      voltageBC: 0,
      voltageCA: 0,
      kwhToday: 0,
      kwhTotal: 0,
      pvChannels: [],
      smuStrings: [],
    });
  } catch (error) {
    next(error);
  }
};
