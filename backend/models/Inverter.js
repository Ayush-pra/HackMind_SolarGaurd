import mongoose from 'mongoose';

const inverterSchema = new mongoose.Schema(
  {
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    inverterId: { type: String, required: true, unique: true, trim: true },
    model: { type: String, required: true, trim: true },
    commonSpecs: { type: Object, default: {} },
    status: { type: String, default: 'active' },
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    riskLevel: { 
      type: String, 
      enum: ['No Risk', 'Degradation Risk', 'Shutdown Risk'], 
      default: 'No Risk' 
    },
    operatingState: {
      type: String,
      enum: ['Running', 'Standby', 'Fault', 'Offline'],
      default: 'Running',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Inverter', inverterSchema);
