import { useState } from 'react';
import PlantForm from '../components/PlantForm';
import InverterForm from '../components/InverterForm';
import TelemetryForm from '../components/TelemetryForm';

const SECTIONS = [
  { key: 'plant', label: 'Add New Plant', icon: '🏗️' },
  { key: 'inverter', label: 'Add New Inverter', icon: '⚡' },
  { key: 'readings', label: 'Add Readings', icon: '📊' },
];

export default function InputPage() {
  const [active, setActive] = useState('plant');
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [selectedInverterId, setSelectedInverterId] = useState('');

  const goToReadings = (plantId, inverterId) => {
    setSelectedPlantId(plantId);
    setSelectedInverterId(inverterId);
    setActive('readings');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Input / Configuration</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add plants, configure inverters, or submit readings data.
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
            <InverterForm
              selectedPlantId={selectedPlantId}
              onPlantChange={setSelectedPlantId}
              goToReadings={goToReadings}
            />
          </>
        )}
        {active === 'readings' && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Readings</h3>
            <TelemetryForm
              selectedPlantId={selectedPlantId}
              onPlantChange={setSelectedPlantId}
              selectedInverterId={selectedInverterId}
              onInverterChange={setSelectedInverterId}
            />
          </>
        )}
      </div>
    </div>
  );
}
