import { useState } from 'react';
import PlantForm from '../components/PlantForm';
import InverterForm from '../components/InverterForm';
import TelemetryForm from '../components/TelemetryForm';

const SECTIONS = [
  { key: 'plant', label: 'Add New Plant', icon: '🏗️' },
  { key: 'inverter', label: 'Add New Inverter', icon: '⚡' },
  { key: 'telemetry', label: 'Add Telemetry', icon: '📊' },
];

export default function InputPage() {
  const [active, setActive] = useState('plant');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Input / Configuration</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add plants, configure inverters, or submit manual telemetry data.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-3">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              active === s.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {active === 'plant' && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Plant</h3>
            <PlantForm />
          </>
        )}
        {active === 'inverter' && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Inverter</h3>
            <InverterForm />
          </>
        )}
        {active === 'telemetry' && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Telemetry / Health Data</h3>
            <TelemetryForm />
          </>
        )}
      </div>
    </div>
  );
}
