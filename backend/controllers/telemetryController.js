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
