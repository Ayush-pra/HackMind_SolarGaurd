export class KPICalculator {
  static computeKpis(history) {
    if (history.length === 0) return {};

    // Build data rows with expanded PV columns
    const data = history.map(h => {
      const row = {
        timestamp: h.timestamp,
        power: h.power || 0,
        temp: h.temp || 0,
        op_state: h.op_state || '',
        alarm_code: h.alarm_code || null,
      };
      if (h.pvVoltages) {
        h.pvVoltages.forEach((v, i) => row[`pv_voltage_${i + 1}`] = v || 0);
      }
      if (h.pvCurrents) {
        h.pvCurrents.forEach((v, i) => row[`pv_current_${i + 1}`] = v || 0);
      }

      // Compute per row aggregates
      const pvVs = h.pvVoltages || [];
      const pvCs = h.pvCurrents || [];
      row.avg_pv_voltage = pvVs.length > 0 ? pvVs.reduce((a, b) => a + b, 0) / pvVs.length : 0;
      row.avg_pv_current = pvCs.length > 0 ? pvCs.reduce((a, b) => a + b, 0) / pvCs.length : 0;
      row.dc_power = row.avg_pv_voltage * row.avg_pv_current;
      row.efficiency = row.power / (row.dc_power + 1e-6);

      return row;
    });

    const n = data.length;
    const latest = data[n - 1];

    const pvVoltageCols = Object.keys(latest).filter(k => k.startsWith('pv_voltage_'));
    const pvCurrentCols = Object.keys(latest).filter(k => k.startsWith('pv_current_'));

    // Power drop
    let power_drop = null;
    if (n >= 2) {
      const prevPower = data[n - 2].power;
      if (prevPower) {
        power_drop = (latest.power - prevPower) / prevPower;
      }
    }

    // Power std 6h
    let power_std_6h = null;
    if (n >= 72) {
      const powers = data.slice(-72).map(d => d.power);
      const mean = powers.reduce((a, b) => a + b, 0) / powers.length;
      power_std_6h = Math.sqrt(powers.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / powers.length);
    }

    // Voltage dev
    let voltage_dev = null;
    if (latest.avg_pv_voltage && n >= 288) {
      const voltages = data.slice(-288).map(d => d.avg_pv_voltage);
      const mean = voltages.reduce((a, b) => a + b, 0) / voltages.length;
      voltage_dev = Math.abs(latest.avg_pv_voltage - mean);
    }

    // Current dev
    let current_dev = null;
    if (latest.avg_pv_current && n >= 288) {
      const currents = data.slice(-288).map(d => d.avg_pv_current);
      const mean = currents.reduce((a, b) => a + b, 0) / currents.length;
      current_dev = Math.abs(latest.avg_pv_current - mean);
    }

    // Imbalances
    const current_imbalance = latest.avg_pv_current ? Math.sqrt(
      pvCurrentCols.map(col => latest[col]).reduce((sum, v) => sum + Math.pow(v - latest.avg_pv_current, 2), 0) / pvCurrentCols.length
    ) : null;
    const voltage_imbalance = latest.avg_pv_voltage ? Math.sqrt(
      pvVoltageCols.map(col => latest[col]).reduce((sum, v) => sum + Math.pow(v - latest.avg_pv_voltage, 2), 0) / pvVoltageCols.length
    ) : null;

    // Efficiency trend
    let efficiency_trend = null;
    if (n >= 288) {
      const efficiencies = data.slice(-288).map(d => d.efficiency);
      efficiency_trend = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
    }

    return {
      power: latest.power,
      temp: latest.temp,
      efficiency: latest.efficiency,
      power_drop,
      voltage_dev,
      current_dev,
      current_imbalance,
      voltage_imbalance,
      power_std_6h,
      efficiency_trend,
      op_state: latest.op_state,
    };
  }
}