import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function PlantForm() {
  const { addPlant } = useAppContext();

  const [form, setForm] = useState({
    name: '',
    location: '',
    pvChannels: '',
    smuStrings: '',
    capacityMW: '',
    description: '',
  });
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Plant name is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.pvChannels || Number(form.pvChannels) < 1)
      errs.pvChannels = 'At least 1 PV channel';
    if (!form.smuStrings || Number(form.smuStrings) < 1)
      errs.smuStrings = 'At least 1 SMU string';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    // Placeholder — will call addPlant(data) API when backend is ready
    addPlant({
      name: form.name,
      location: form.location,
      pvChannels: Number(form.pvChannels),
      smuStrings: Number(form.smuStrings),
      capacityMW: form.capacityMW ? Number(form.capacityMW) : null,
      description: form.description,
    });

    setSuccess(`Plant "${form.name}" added successfully!`);
    setForm({ name: '', location: '', pvChannels: '', smuStrings: '', capacityMW: '', description: '' });
  };

  const inputCls = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Plant Name" name="name" value={form.name} onChange={handleChange} cls={inputCls('name')} error={errors.name} />
        <Field label="Location" name="location" value={form.location} onChange={handleChange} cls={inputCls('location')} error={errors.location} placeholder="City, State" />
        <Field label="PV Input Channels" name="pvChannels" value={form.pvChannels} onChange={handleChange} cls={inputCls('pvChannels')} error={errors.pvChannels} type="number" />
        <Field label="SMU Strings" name="smuStrings" value={form.smuStrings} onChange={handleChange} cls={inputCls('smuStrings')} error={errors.smuStrings} type="number" />
        <Field label="Plant Capacity (MW)" name="capacityMW" value={form.capacityMW} onChange={handleChange} cls={inputCls('capacityMW')} type="number" placeholder="Optional" />
        <Field label="Description" name="description" value={form.description} onChange={handleChange} cls={inputCls('description')} placeholder="Optional notes" />
      </div>

      {success && <p className="text-sm text-green-600">{success}</p>}

      <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
        Add Plant
      </button>
    </form>
  );
}

function Field({ label, name, value, onChange, cls, error, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className={cls} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
