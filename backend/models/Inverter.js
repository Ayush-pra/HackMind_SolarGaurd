import mongoose from 'mongoose';

const inverterSchema = new mongoose.Schema(
  {
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    inverterId: { type: String, required: true, unique: true, trim: true },
    model: { type: String, required: true, trim: true },
    commonSpecs: { type: Object, default: {} },
    status: { type: String, default: 'active' },
    riskScore: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ['Critical', 'High', 'Moderate', 'Low'], default: 'Low' },
    operatingState: {
      type: String,
      enum: ['Running', 'Standby', 'Fault', 'Offline'],
      default: 'Running',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Inverter', inverterSchema);
