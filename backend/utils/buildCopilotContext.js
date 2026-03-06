import Plant from '../models/Plant.js';
import Inverter from '../models/Inverter.js';
import Telemetry from '../models/Telemetry.js';
import Prediction from '../models/Prediction.js';
import Fault from '../models/Fault.js';

/**
 * Gather relevant MongoDB data and build a plain-text context block
 * that is prepended to the user's question before sending to the LLM.
 */
const buildCopilotContext = async ({ plantId, inverterId }) => {
  const lines = [];
  const relatedEntities = [];

  // ── Plant context ─────────────────────────────────────────────────────────
  if (plantId) {
    const plant = await Plant.findById(plantId).lean();
    if (plant) {
      lines.push(`Plant: ${plant.name}`);
      lines.push(`Location: ${plant.location}`);
      lines.push(`Capacity: ${plant.capacityMW ?? 'N/A'} MW`);
      lines.push(`Architecture: ${plant.architecture.pvInputChannels} PV channels, ${plant.architecture.smuStrings} SMU strings`);
      if (plant.description) lines.push(`Description: ${plant.description}`);
      relatedEntities.push({ type: 'plant', id: plantId });
    }
  }

  // ── Inverter context ──────────────────────────────────────────────────────
  if (inverterId) {
    const inverter = await Inverter.findOne({ inverterId }).lean();
    if (inverter) {
      lines.push(`Inverter: ${inverter.inverterId} (${inverter.model})`);
      lines.push(`Operating State: ${inverter.operatingState}`);
      lines.push(`Risk Score: ${inverter.riskScore}`);
      lines.push(`Risk Level: ${inverter.riskLevel}`);
      relatedEntities.push({ type: 'inverter', id: inverterId });

      // Latest telemetry
      const telemetry = await Telemetry.findOne({ inverterId: inverter._id })
        .sort({ createdAt: -1 })
        .lean();

      if (telemetry) {
        lines.push('--- Latest Telemetry ---');
        if (telemetry.temperature != null) lines.push(`Temperature: ${telemetry.temperature} °C`);
        if (telemetry.outputPower != null) lines.push(`Output Power: ${telemetry.outputPower} kW`);
        if (telemetry.pvVoltages?.length) lines.push(`PV Voltages: [${telemetry.pvVoltages.join(', ')}] V`);
        if (telemetry.pvCurrents?.length) lines.push(`PV Currents: [${telemetry.pvCurrents.join(', ')}] A`);
        if (telemetry.smuStrings?.length) lines.push(`SMU Strings: [${telemetry.smuStrings.join(', ')}]`);
        if (telemetry.alarmCode != null) lines.push(`Alarm Code: ${telemetry.alarmCode}`);
        if (telemetry.opState) lines.push(`Operational State: ${telemetry.opState}`);
        if (telemetry.frequency != null) lines.push(`Frequency: ${telemetry.frequency} Hz`);
        if (telemetry.voltageAB != null) lines.push(`Voltage AB: ${telemetry.voltageAB} V`);
        if (telemetry.voltageBC != null) lines.push(`Voltage BC: ${telemetry.voltageBC} V`);
        if (telemetry.voltageCA != null) lines.push(`Voltage CA: ${telemetry.voltageCA} V`);
        if (telemetry.efficiency != null) lines.push(`Efficiency: ${telemetry.efficiency}%`);
        if (telemetry.irradiance != null) lines.push(`Irradiance: ${telemetry.irradiance} W/m²`);
        if (telemetry.stringImbalance != null) lines.push(`String Imbalance: ${telemetry.stringImbalance}%`);
        if (telemetry.kwhToday != null) lines.push(`kWh Today: ${telemetry.kwhToday}`);
        if (telemetry.kwhTotal != null) lines.push(`kWh Total: ${telemetry.kwhTotal}`);
        if (telemetry.faultNotes) lines.push(`Fault Notes: ${telemetry.faultNotes}`);
      }

      // Latest prediction
      const prediction = await Prediction.findOne({ inverterId: inverter._id })
        .sort({ createdAt: -1 })
        .lean();

      if (prediction) {
        lines.push('--- Prediction ---');
        lines.push(`Predicted Risk Score: ${prediction.riskScore}`);
        lines.push(`Predicted Risk Level: ${prediction.riskLevel}`);
        lines.push(`Estimated Days to Event: ${prediction.estimatedDaysToEvent}`);
        lines.push(`Risk Trend: ${prediction.riskTrend}`);
      }

      // Active faults
      const faults = await Fault.find({ inverterId: inverter._id }).lean();
      if (faults.length) {
        lines.push('--- Active Faults ---');
        faults.forEach((f) => {
          lines.push(`• ${f.faultName} (${f.faultCode}) — Severity: ${f.severity}`);
        });
      } else {
        lines.push('No active faults.');
      }

      // If we don't have plantId but inverter has one, fetch it
      if (!plantId && inverter.plantId) {
        const plant = await Plant.findById(inverter.plantId).lean();
        if (plant) {
          lines.unshift(`Plant: ${plant.name} (${plant.location})`);
          relatedEntities.push({ type: 'plant', id: String(inverter.plantId) });
        }
      }
    }
  }

  return {
    contextText: lines.length ? lines.join('\n') : '',
    relatedEntities,
  };
};

export default buildCopilotContext;
