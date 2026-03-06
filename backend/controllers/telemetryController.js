import Telemetry from '../models/Telemetry.js';
import Inverter from '../models/Inverter.js';
import { validateArchitectureFields } from '../utils/validateArchitecture.js';

// POST /api/telemetry
export const createTelemetry = async (req, res, next) => {
  try {
    const {
      plantId,
      inverterId, // This is the string inverterId (e.g. "INV-A01")
      temperature,
      frequency,
      voltageAB,
      voltageBC,
      voltageCA,
      output,
      efficiency,
      irradiance,
      stringImbalance,
      faultNotes,
      pvChannels,
      smuStrings,
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
    const archError = await validateArchitectureFields(plantId, pvChannels, smuStrings);
    if (archError) {
      return res.status(400).json({ message: archError });
    }

    const telemetry = await Telemetry.create({
      plantId,
      inverterId: inverter._id,
      temperature: temperature ?? null,
      frequency: frequency ?? null,
      voltageAB: voltageAB ?? null,
      voltageBC: voltageBC ?? null,
      voltageCA: voltageCA ?? null,
      outputPower: output ?? null,
      efficiency: efficiency ?? null,
      irradiance: irradiance ?? null,
      stringImbalance: stringImbalance ?? null,
      kwhToday: req.body.kwhToday ?? null,
      kwhTotal: req.body.kwhTotal ?? null,
      faultNotes: faultNotes || '',
      pvChannels: pvChannels || [],
      smuStrings: smuStrings || [],
    });

    res.status(201).json({
      message: 'Telemetry recorded successfully',
      telemetry: {
        id: telemetry._id,
        plantId: telemetry.plantId,
        inverterId: inverterId,
        createdAt: telemetry.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
