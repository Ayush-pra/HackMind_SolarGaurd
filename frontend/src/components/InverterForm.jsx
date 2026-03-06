import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import DynamicArchitectureFields from './DynamicArchitectureFields';

export default function InverterForm() {
  const { plants, addInverter } = useAppContext();

  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [form, setForm] = useState({
    inverterId: '',
    model: '',
    temperature: '',
    frequency: '',
    voltageAB: '',
    voltageBC: '',
    voltageCA: '',
    output: '',
    efficiency: '',
    kwhToday: '',
    kwhTotal: '',
    operatingState: 'Running',
  });
  const [dynValues, setDynValues] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const plant = plants.find((p) => p.id === selectedPlantId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDynChange = (key, value) => {
    setDynValues((prev) => ({ ...prev, [key]: value }));
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
      setSuccess(`Inverter "${form.inverterId}" added to ${plant.name}`);
      setForm({ inverterId: '', model: '', temperature: '', frequency: '', voltageAB: '', voltageBC: '', voltageCA: '', output: '', efficiency: '', kwhToday: '', kwhTotal: '', operatingState: 'Running' });
      setDynValues({});
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
          onChange={(e) => { setSelectedPlantId(e.target.value); setDynValues({}); }}
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
        <Inp label="Temperature (°C)" name="temperature" value={form.temperature} onChange={handleChange} cls={inputCls('temperature')} type="number" />
        <Inp label="Frequency (Hz)" name="frequency" value={form.frequency} onChange={handleChange} cls={inputCls('frequency')} type="number" />
        <Inp label="Voltage AB (V)" name="voltageAB" value={form.voltageAB} onChange={handleChange} cls={inputCls('voltageAB')} type="number" />
        <Inp label="Voltage BC (V)" name="voltageBC" value={form.voltageBC} onChange={handleChange} cls={inputCls('voltageBC')} type="number" />
        <Inp label="Voltage CA (V)" name="voltageCA" value={form.voltageCA} onChange={handleChange} cls={inputCls('voltageCA')} type="number" />
        <Inp label="Output Power (kW)" name="output" value={form.output} onChange={handleChange} cls={inputCls('output')} type="number" />
        <Inp label="Efficiency (%)" name="efficiency" value={form.efficiency} onChange={handleChange} cls={inputCls('efficiency')} type="number" />
        <Inp label="kWh Today" name="kwhToday" value={form.kwhToday} onChange={handleChange} cls={inputCls('kwhToday')} type="number" />
        <Inp label="kWh Total" name="kwhTotal" value={form.kwhTotal} onChange={handleChange} cls={inputCls('kwhTotal')} type="number" />
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

      {/* Dynamic architecture fields */}
      {plant && (
        <div className="space-y-4 pt-2">
          <DynamicArchitectureFields prefix="pv" count={plant.pvChannels} values={dynValues} onChange={handleDynChange} />
          <DynamicArchitectureFields prefix="string" count={plant.smuStrings} values={dynValues} onChange={handleDynChange} />
        </div>
      )}

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
