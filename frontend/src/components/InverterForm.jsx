import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function InverterForm({ selectedPlantId: parentPlantId, onPlantChange, goToReadings }) {
  const { plants, addInverter } = useAppContext();

  const selectedPlantId = parentPlantId || '';
  const [form, setForm] = useState({
    inverterId: '',
    model: '',
    operatingState: 'Running',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const plant = plants.find((p) => p.id === selectedPlantId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!selectedPlantId) errs.plant = 'Select a plant';
    if (!form.inverterId.trim()) errs.inverterId = 'Inverter ID is required';
    if (!form.model.trim()) errs.model = 'Model name is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    try {
      await addInverter({
        plantId: selectedPlantId,
        inverterId: form.inverterId,
        model: form.model,
        operatingState: form.operatingState,
      });

      const addedInverterId = form.inverterId;
      setSuccess(`Inverter "${addedInverterId}" added to ${plant.name}. Switching to Add Readings…`);
      setForm({ inverterId: '', model: '', operatingState: 'Running' });

      // Auto-switch to readings with same plant + newly added inverter
      setTimeout(() => {
        goToReadings(selectedPlantId, addedInverterId);
      }, 800);
    } catch (err) {
      setErrors({ inverterId: err.response?.data?.message || 'Failed to add inverter' });
    }
  };

  const inputCls = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Plant selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plant</label>
        <select
          value={selectedPlantId}
          onChange={(e) => onPlantChange(e.target.value)}
          className={inputCls('plant')}
        >
          <option value="">Select a plant</option>
          {plants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {errors.plant && <p className="mt-1 text-xs text-red-600">{errors.plant}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Inp label="Inverter ID" name="inverterId" value={form.inverterId} onChange={handleChange} cls={inputCls('inverterId')} error={errors.inverterId} placeholder="e.g. INV-A04" />
        <Inp label="Model" name="model" value={form.model} onChange={handleChange} cls={inputCls('model')} error={errors.model} placeholder="e.g. SUN2000-100KTL" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Operating State</label>
          <select name="operatingState" value={form.operatingState} onChange={handleChange} className={inputCls('operatingState')}>
            <option>Running</option>
            <option>Standby</option>
            <option>Fault</option>
            <option>Offline</option>
          </select>
        </div>
      </div>

      {success && <p className="text-sm text-green-600">{success}</p>}

      <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
        Add Inverter
      </button>
    </form>
  );
}

function Inp({ label, name, value, onChange, cls, error, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className={cls} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
