const SEV_COLORS = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-green-100 text-green-700 border-green-200',
};

export default function FaultList({ faults = [] }) {
  if (!faults.length) {
    return (
      <div className="text-sm text-gray-400 py-4 text-center">
        No active faults
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {faults.map((f, i) => (
        <div
          key={i}
          className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
            SEV_COLORS[f.severity] || 'bg-gray-50 text-gray-600 border-gray-200'
          }`}
        >
          <div>
            <p className="text-sm font-medium">{f.name}</p>
            <p className="text-xs opacity-70">{f.code}</p>
          </div>
          <span className="text-xs font-semibold">{f.severity}</span>
        </div>
      ))}
    </div>
  );
}
