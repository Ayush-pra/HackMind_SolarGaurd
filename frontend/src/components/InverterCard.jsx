import { useNavigate } from 'react-router-dom';
import RiskGauge from './RiskGauge';

const RISK_DOT = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Moderate: 'bg-yellow-500',
  Low: 'bg-green-500',
};

export default function InverterCard({ inverter }) {
  const navigate = useNavigate();
  const dot = RISK_DOT[inverter.riskLabel] || 'bg-gray-400';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{inverter.id}</h3>
          <p className="text-xs text-gray-500">{inverter.model}</p>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full mt-1 ${dot}`} />
      </div>

      {/* Gauge */}
      <div className="flex justify-center">
        <RiskGauge score={inverter.riskScore} label={inverter.riskLabel} size={110} />
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Metric label="Temp" value={`${inverter.temperature}°C`} />
        <Metric label="Output" value={`${inverter.output} kW`} />
        <Metric label="Efficiency" value={`${inverter.efficiency}%`} />
        <Metric label="Faults" value={inverter.activeFaults} warn={inverter.activeFaults > 0} />
      </div>

      {/* Days to event */}
      <p className="text-xs text-gray-500 text-center">
        Est. <span className="font-semibold text-gray-800">{inverter.daysToEvent}</span> days to
        predicted event
      </p>

      {/* Analyze button */}
      <button
        onClick={() => navigate(`/inverter/${inverter.id}`)}
        className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Analyze
      </button>
    </div>
  );
}

function Metric({ label, value, warn }) {
  return (
    <div>
      <span className="text-gray-500 text-xs">{label}</span>
      <p className={`font-medium ${warn ? 'text-red-600' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}
