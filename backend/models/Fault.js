import mongoose from 'mongoose';

const faultSchema = new mongoose.Schema(
  {
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    inverterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inverter', required: true },
    faultCode: { type: String, required: true, trim: true },
    faultName: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Moderate', 'Low'],
      required: true,
    },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Fault', faultSchema);
