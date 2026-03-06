import Plant from '../models/Plant.js';

/**
 * Validate that pvChannels and smuStrings arrays match a plant's architecture.
 * Returns null if valid, or an error message string if invalid.
 */
export const validateArchitectureFields = async (plantId, pvChannels, smuStrings) => {
  const plant = await Plant.findById(plantId);
  if (!plant) return 'Plant not found';

  const expectedPV = plant.architecture.pvInputChannels;
  const expectedSMU = plant.architecture.smuStrings;

  if (pvChannels && pvChannels.length !== expectedPV) {
    return `pvChannels array length (${pvChannels.length}) does not match plant architecture (${expectedPV} PV input channels)`;
  }

  if (smuStrings && smuStrings.length !== expectedSMU) {
    return `smuStrings array length (${smuStrings.length}) does not match plant architecture (${expectedSMU} SMU strings)`;
  }

  return null;
};
