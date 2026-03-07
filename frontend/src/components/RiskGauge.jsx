const RISK_COLORS = {
  "No Risk": { stroke: "#22c55e", bg: "#f0fdf4" },
  "Degradation Risk": { stroke: "#eab308", bg: "#fefce8" },
  "Shutdown Risk": { stroke: "#ef4444", bg: "#fef2f2" },
};

export default function RiskGauge({ score = 0, label = "Low", size = 100 }) {
  const config = RISK_COLORS[label] || RISK_COLORS.Low;
  const radius = (size - 12) / 2;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 10}
        viewBox={`0 0 ${size} ${size / 2 + 10}`}
      >
        {/* Background arc */}
        <path
          d={`M 6 ${center} A ${radius} ${radius} 0 0 1 ${size - 6} ${center}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M 6 ${center} A ${radius} ${radius} 0 0 1 ${size - 6} ${center}`}
          fill="none"
          stroke={config.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        {/* Score text */}
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          className="text-lg font-bold"
          fill={config.stroke}
          fontSize={size * 0.22}
        >
          {score}%
        </text>
      </svg>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1"
        style={{ color: config.stroke, backgroundColor: config.bg }}
      >
        {label}
      </span>
    </div>
  );
}
