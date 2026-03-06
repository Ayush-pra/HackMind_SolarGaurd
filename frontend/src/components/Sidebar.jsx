import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Sidebar() {
  const { plants, invertersByPlant, selectedPlantId, setSelectedPlantId, logout } =
    useAppContext();
  const navigate = useNavigate();

  const linkBase =
    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors';
  const linkActive = 'bg-indigo-50 text-indigo-700';
  const linkIdle = 'text-gray-600 hover:bg-gray-100';

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      {/* Branding */}
      <div className="px-5 py-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight">
          SolarSense AI
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Inverter Monitoring</p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkIdle}`
          }
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink
          to="/input"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkIdle}`
          }
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Input / Config
        </NavLink>

        {/* Divider */}
        <div className="pt-4 pb-2">
          <span className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Plants
          </span>
        </div>

        {plants.map((plant) => (
          <div key={plant.id}>
            {/* Plant header */}
            <button
              onClick={() => {
                setSelectedPlantId(plant.id);
                navigate('/dashboard');
              }}
              className={`${linkBase} w-full justify-between ${
                selectedPlantId === plant.id
                  ? 'text-indigo-700 font-semibold'
                  : 'text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                {plant.name}
              </span>
              <span className="text-xs text-gray-400">
                {invertersByPlant[plant.id]?.length || 0}
              </span>
            </button>

            {/* Inverter list */}
            <div className="ml-6 space-y-0.5">
              {(invertersByPlant[plant.id] || []).map((inv) => (
                <NavLink
                  key={inv.id}
                  to={`/inverter/${inv.id}`}
                  className={({ isActive }) =>
                    `block px-3 py-1.5 rounded-md text-xs transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {inv.id}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
