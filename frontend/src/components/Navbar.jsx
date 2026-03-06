import { useAppContext } from '../context/AppContext';

export default function Navbar() {
  const { plants, selectedPlantId, setSelectedPlantId, plantInverters, user } =
    useAppContext();

  const criticalCount = plantInverters.filter(
    (inv) => inv.riskLabel === 'Critical'
  ).length;

  const totalCapacity = plantInverters.reduce(
    (sum, inv) => sum + (inv.output || 0),
    0
  );

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Left */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">
            SolarSense AI
          </h2>

          {/* Plant selector */}
          <select
            value={selectedPlantId || ''}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Fleet capacity */}
          <span className="hidden md:inline text-xs text-gray-500">
            Fleet Output:{' '}
            <span className="font-semibold text-gray-800">
              {totalCapacity.toFixed(1)} kW
            </span>
          </span>

          {/* Critical alerts */}
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {criticalCount} Critical
            </span>
          )}

          {/* Notifications bell */}
          <button className="relative rounded-full p-1.5 text-gray-500 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
            </svg>
            {criticalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                {criticalCount}
              </span>
            )}
          </button>

          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
