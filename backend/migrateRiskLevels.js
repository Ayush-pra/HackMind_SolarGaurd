import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inverter from './models/Inverter.js';
import Prediction from './models/Prediction.js';

dotenv.config();

const RISK_MAPPING = {
  'Low': 'No Risk',
  'Moderate': 'Degradation Risk',
  'High': 'Degradation Risk',
  'Critical': 'Shutdown Risk'
};

async function migrateRiskLevels() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Migrate Inverter collection
    console.log('Migrating Inverter collection...');
    const inverters = await Inverter.find({ riskLevel: { $in: Object.keys(RISK_MAPPING) } });
    for (const inverter of inverters) {
      const newRiskLevel = RISK_MAPPING[inverter.riskLevel];
      if (newRiskLevel) {
        await Inverter.findByIdAndUpdate(inverter._id, { riskLevel: newRiskLevel });
        console.log(`Updated inverter ${inverter.inverterId}: ${inverter.riskLevel} → ${newRiskLevel}`);
      }
    }

    // Migrate Prediction collection
    console.log('Migrating Prediction collection...');
    const predictions = await Prediction.find({ riskLevel: { $in: Object.keys(RISK_MAPPING) } });
    for (const prediction of predictions) {
      const newRiskLevel = RISK_MAPPING[prediction.riskLevel];
      if (newRiskLevel) {
        await Prediction.findByIdAndUpdate(prediction._id, { riskLevel: newRiskLevel });
        console.log(`Updated prediction for inverter ${prediction.inverterId}: ${prediction.riskLevel} → ${newRiskLevel}`);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateRiskLevels();