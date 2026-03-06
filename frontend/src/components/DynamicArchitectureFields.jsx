export default function DynamicArchitectureFields({ prefix, count, values, onChange }) {
  if (!count || count <= 0) return null;

  const fields = Array.from({ length: count }, (_, i) => {
    const key = `${prefix}${i + 1}`;
    return (
      <div key={key}>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {prefix.toUpperCase()}{i + 1}
        </label>
        <input
          type="number"
          step="0.01"
          value={values[key] || ''}
          onChange={(e) => onChange(key, e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  });

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
        {prefix === 'pv' ? 'PV Channel Values' : 'SMU String Values'}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{fields}</div>
    </div>
  );
}
