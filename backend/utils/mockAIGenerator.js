/**
 * Generate a mock AI analysis report for an inverter.
 * Replace this with real ML inference when ready.
 */
export const generateMockAnalysis = (inverter, telemetry, faults) => {
  const invId = inverter.inverterId;
  const temp = telemetry?.temperature ?? 60;
  const eff = telemetry?.efficiency ?? 95;
  const faultCount = faults?.length ?? 0;

  const faultSummary = faults.length
    ? faults.map((f) => `${f.faultName} (${f.faultCode})`).join(', ')
    : 'no active faults';

  return {
    executiveSummary: `Inverter ${invId} is operating at ${eff}% efficiency with ${faultCount} active fault(s): ${faultSummary}. Temperature reading is ${temp}°C. ${
      temp > 70
        ? 'Elevated thermal conditions detected — recommend thermal management review.'
        : 'Thermal conditions are within normal range.'
    }`,

    rootCauseHypotheses: [
      {
        title: 'Thermal Management Degradation',
        detail: `Heat sink thermal resistance may have increased. Current temperature ${temp}°C ${
          temp > 70 ? 'exceeds' : 'is within'
        } the optimal range. Fan speed and thermal paste condition should be verified.`,
        confidence: temp > 70 ? 85 : 40,
      },
      {
        title: 'Grid Voltage Instability',
        detail:
          'Grid voltage fluctuations can force protective shutdowns, increasing thermal cycling stress on power electronics components.',
        confidence: faults.some((f) => f.faultCode?.startsWith('F-2')) ? 72 : 35,
      },
      {
        title: 'String Current Mismatch',
        detail:
          'PV string current imbalance may indicate module degradation or soiling, reducing overall inverter efficiency.',
        confidence: eff < 94 ? 68 : 30,
      },
    ],

    operationalImpact: {
      energyLoss: `~${Math.round((100 - eff) * 3.4)} kWh/day below expected output`,
      financialImpact: `$${Math.round((100 - eff) * 128).toLocaleString()}/month estimated revenue loss`,
      cascadeRisk:
        faultCount >= 2
          ? 'Adjacent inverters may experience increased load if this unit trips offline.'
          : 'Low cascade risk at current fault level.',
    },

    failureTimeline: [
      {
        timeframe: '0–7 days',
        event: 'Continued operational stress',
        probability: Math.min(95, 50 + faultCount * 15),
      },
      {
        timeframe: '7–14 days',
        event: 'Possible component degradation',
        probability: Math.min(85, 30 + faultCount * 12),
      },
      {
        timeframe: '14–30 days',
        event: 'Forced shutdown risk',
        probability: Math.min(70, 15 + faultCount * 10),
      },
    ],

    recommendedActions: [
      { priority: 'Immediate', action: 'Inspect and clean heat sink assembly. Verify fan operation.' },
      ...(faultCount > 0
        ? [{ priority: 'Immediate', action: `Investigate active faults: ${faultSummary}.` }]
        : []),
      { priority: 'Short-term', action: 'Schedule thermal paste replacement on power module.' },
      { priority: 'Medium-term', action: 'Install string-level monitoring for early degradation detection.' },
    ],

    overallConfidence: Math.round(55 + faultCount * 8 + (temp > 70 ? 15 : 0)),
  };
};
