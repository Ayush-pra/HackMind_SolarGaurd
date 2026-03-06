import Plant from '../models/Plant.js';

/**
 * Validate that pvVoltages, pvCurrents, and smuStrings arrays match a plant's architecture.
 * Returns null if valid, or an error message string if invalid.
 */
export const validateArchitectureFields = async (plantId, pvVoltages, pvCurrents, smuStrings) => {
  const plant = await Plant.findById(plantId);
  if (!plant) return 'Plant not found';

  const expectedPV = plant.architecture.pvInputChannels;
  const expectedSMU = plant.architecture.smuStrings;

  if (pvVoltages && pvVoltages.length !== expectedPV) {
    return `pvVoltages array length (${pvVoltages.length}) does not match plant architecture (${expectedPV} PV input channels)`;
  }

  if (pvCurrents && pvCurrents.length !== expectedPV) {
    return `pvCurrents array length (${pvCurrents.length}) does not match plant architecture (${expectedPV} PV input channels)`;
  }

  if (smuStrings && smuStrings.length !== expectedSMU) {
    return `smuStrings array length (${smuStrings.length}) does not match plant architecture (${expectedSMU} SMU strings)`;
  }

  return null;
};
