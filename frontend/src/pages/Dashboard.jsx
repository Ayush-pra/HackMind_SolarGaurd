import { useAppContext } from '../context/AppContext';
import InverterCard from '../components/InverterCard';

const RISK_ORDER = { Critical: 0, High: 1, Moderate: 2, Low: 3 };

export default function Dashboard() {
  const { selectedPlant, plantInverters } = useAppContext();

  if (!selectedPlant) {
    return <p className="text-gray-500">Select a plant from the sidebar.</p>;
  }

  const riskCounts = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
  plantInverters.forEach((inv) => {
    riskCounts[inv.riskLabel] = (riskCounts[inv.riskLabel] || 0) + 1;
  });
  const total = plantInverters.length || 1;

  const sorted = [...plantInverters].sort(
    (a, b) => (RISK_ORDER[a.riskLabel] ?? 4) - (RISK_ORDER[b.riskLabel] ?? 4)
  );

  return (
    <div className="space-y-6">
      {/* Fleet Status Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{selectedPlant.name}</h2>
            <p className="text-sm text-gray-500">
              {selectedPlant.location} &middot; {plantInverters.length} inverter{plantInverters.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Badge label="Critical" count={riskCounts.Critical} color="bg-red-100 text-red-700" />
            <Badge label="High" count={riskCounts.High} color="bg-orange-100 text-orange-700" />
            <Badge label="Moderate" count={riskCounts.Moderate} color="bg-yellow-100 text-yellow-700" />
            <Badge label="Low" count={riskCounts.Low} color="bg-green-100 text-green-700" />
          </div>
        </div>

        {/* Risk distribution bar */}
        <div className="mt-4 h-2.5 w-full rounded-full bg-gray-100 flex overflow-hidden">
          <div className="bg-red-500 transition-all" style={{ width: `${(riskCounts.Critical / total) * 100}%` }} />
          <div className="bg-orange-500 transition-all" style={{ width: `${(riskCounts.High / total) * 100}%` }} />
          <div className="bg-yellow-400 transition-all" style={{ width: `${(riskCounts.Moderate / total) * 100}%` }} />
          <div className="bg-green-500 transition-all" style={{ width: `${(riskCounts.Low / total) * 100}%` }} />
        </div>
      </div>

      {/* Inverter cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sorted.map((inv) => (
          <InverterCard key={inv.id} inverter={inv} />
        ))}
      </div>
    </div>
  );
}

function Badge({ label, count, color }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
      {label}
      <span className="font-bold">{count}</span>
    </span>
  );
}
