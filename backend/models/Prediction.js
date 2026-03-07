import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    inverterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inverter', required: true },

    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    riskLevel: { 
      type: String, 
      enum: ['No Risk', 'Degradation Risk', 'Shutdown Risk'], 
      default: 'No Risk' 
    },
    estimatedDaysToEvent: { type: Number, default: 365 },
    riskTrend: { type: String, enum: ['rising', 'stable', 'falling'], default: 'stable' },

    historicalRisk: { type: [Object], default: [] },
    forecastRisk: { type: [Object], default: [] },

    historicalPower: { type: [Object], default: [] },
    forecastPower: { type: [Object], default: [] },

    aiAnalysis: { type: Object, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Prediction', predictionSchema);
