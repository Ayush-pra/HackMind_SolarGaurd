import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    inverterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inverter', required: true },

    temperature: { type: Number, default: null },
    outputPower: { type: Number, default: null },

    pvVoltages: { type: [Number], default: [] },
    pvCurrents: { type: [Number], default: [] },
    smuStrings: { type: [Number], default: [] },

    alarmCode: { type: Number, default: null },
    opState: { type: String, default: '' },

    // Optional monitoring fields
    frequency: { type: Number, default: null },
    voltageAB: { type: Number, default: null },
    voltageBC: { type: Number, default: null },
    voltageCA: { type: Number, default: null },
    efficiency: { type: Number, default: null },
    irradiance: { type: Number, default: null },
    stringImbalance: { type: Number, default: null },
    kwhToday: { type: Number, default: null },
    kwhTotal: { type: Number, default: null },
    faultNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Telemetry', telemetrySchema);
