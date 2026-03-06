import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    capacityMW: { type: Number, default: null },
    architecture: {
      pvInputChannels: { type: Number, required: true, min: 1 },
      smuStrings: { type: Number, required: true, min: 1 },
    },
    description: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Plant', plantSchema);
