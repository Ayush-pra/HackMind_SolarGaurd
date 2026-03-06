import Plant from '../models/Plant.js';

// GET /api/plants
export const getPlants = async (req, res, next) => {
  try {
    const plants = await Plant.find().sort({ createdAt: -1 });

    // Map to the shape the frontend expects
    const result = plants.map((p) => ({
      id: p._id,
      name: p.name,
      location: p.location,
      capacityMW: p.capacityMW,
      description: p.description,
      pvChannels: p.architecture.pvInputChannels,
      smuStrings: p.architecture.smuStrings,
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/plants
export const createPlant = async (req, res, next) => {
  try {
    const { name, location, pvChannels, smuStrings, capacityMW, description } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: 'Name and location are required' });
    }
    if (!pvChannels || pvChannels < 1) {
      return res.status(400).json({ message: 'At least 1 PV input channel is required' });
    }
    if (!smuStrings || smuStrings < 1) {
      return res.status(400).json({ message: 'At least 1 SMU string is required' });
    }

    const plant = await Plant.create({
      name,
      location,
      capacityMW: capacityMW || null,
      architecture: {
        pvInputChannels: Number(pvChannels),
        smuStrings: Number(smuStrings),
      },
      description: description || '',
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      id: plant._id,
      name: plant.name,
      location: plant.location,
      capacityMW: plant.capacityMW,
      description: plant.description,
      pvChannels: plant.architecture.pvInputChannels,
      smuStrings: plant.architecture.smuStrings,
    });
  } catch (error) {
    next(error);
  }
};
