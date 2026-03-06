import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    inverterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inverter', required: true },

    temperature: { type: Number, default: null },
    frequency: { type: Number, default: null },

    voltageAB: { type: Number, default: null },
    voltageBC: { type: Number, default: null },
    voltageCA: { type: Number, default: null },

    outputPower: { type: Number, default: null },
    efficiency: { type: Number, default: null },

    irradiance: { type: Number, default: null },
    stringImbalance: { type: Number, default: null },

    kwhToday: { type: Number, default: null },
    kwhTotal: { type: Number, default: null },

    faultNotes: { type: String, default: '' },

    pvChannels: { type: [Number], default: [] },
    smuStrings: { type: [Number], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Telemetry', telemetrySchema);
