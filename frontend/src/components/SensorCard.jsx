export default function SensorCard({ label, value, unit, status, threshold }) {
  const statusColors = {
    Normal: 'bg-green-100 text-green-700',
    Warning: 'bg-yellow-100 text-yellow-700',
    Critical: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {status && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              statusColors[status] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {status}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
      {threshold && <p className="text-xs text-gray-400">Normal: {threshold}</p>}
    </div>
  );
}
