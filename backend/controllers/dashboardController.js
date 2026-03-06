import Plant from '../models/Plant.js';
import Inverter from '../models/Inverter.js';
import Telemetry from '../models/Telemetry.js';
import Fault from '../models/Fault.js';
import Prediction from '../models/Prediction.js';

// GET /api/dashboard/:plantId
export const getDashboard = async (req, res, next) => {
  try {
    const { plantId } = req.params;

    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    const inverters = await Inverter.find({ plantId });

    // Build enriched inverter list
    const enriched = await Promise.all(
      inverters.map(async (inv) => {
        // Latest telemetry
        const telemetry = await Telemetry.findOne({ inverterId: inv._id }).sort({ createdAt: -1 });
        // Latest prediction
        const prediction = await Prediction.findOne({ inverterId: inv._id }).sort({ createdAt: -1 });
        // Active faults count
        const activeFaultsCount = await Fault.countDocuments({ inverterId: inv._id });

        const riskScore = prediction?.riskScore ?? inv.riskScore;
        const riskLevel = prediction?.riskLevel ?? inv.riskLevel;

        return {
          id: inv.inverterId,
          _id: inv._id,
          plantId: inv.plantId,
          model: inv.model,
          riskScore,
          riskLabel: riskLevel,
          temperature: telemetry?.temperature ?? 0,
          output: telemetry?.outputPower ?? 0,
          temperature: telemetry?.temperature ?? 0,
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
          faultNotes: telemetry?.faultNotes ?? '',
          activeFaults: activeFaultsCount,
          daysToEvent: prediction?.estimatedDaysToEvent ?? 365,
          riskTrend: prediction?.riskTrend ?? 'stable',
          operatingState: inv.operatingState,
          pvVoltages: telemetry?.pvVoltages ?? [],
          pvCurrents: telemetry?.pvCurrents ?? [],
          smuStrings: telemetry?.smuStrings ?? [],
          alarmCode: telemetry?.alarmCode ?? null,
          opState: telemetry?.opState ?? '',
        };
      })
    );

    // Risk counts
    const riskCounts = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
    enriched.forEach((inv) => {
      riskCounts[inv.riskLabel] = (riskCounts[inv.riskLabel] || 0) + 1;
    });

    res.json({
      plant: {
        id: plant._id,
        name: plant.name,
        location: plant.location,
        capacityMW: plant.capacityMW,
        description: plant.description,
        pvChannels: plant.architecture.pvInputChannels,
        smuStrings: plant.architecture.smuStrings,
      },
      inverterCount: inverters.length,
      riskCounts,
      inverters: enriched,
    });
  } catch (error) {
    next(error);
  }
};
