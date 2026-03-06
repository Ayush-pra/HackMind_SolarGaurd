import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { addTelemetry } from "../api/inputApi";
import DynamicArchitectureFields from "./DynamicArchitectureFields";

export default function TelemetryForm({
  selectedPlantId: parentPlantId,
  onPlantChange,
  selectedInverterId: parentInverterId,
  onInverterChange,
}) {
  const { plants, inverters, refreshInvertersForPlant } = useAppContext();

  const selectedPlantId = parentPlantId || "";
  const selectedInverterId = parentInverterId || "";

  const [form, setForm] = useState({
    temperature: "",
    output: "",
    alarmCode: "",
    opState: "",
    frequency: "",
    voltageAB: "",
    voltageBC: "",
    voltageCA: "",
    efficiency: "",
    irradiance: "",
    stringImbalance: "",
    kwhToday: "",
    kwhTotal: "",
    faultNotes: "",
  });
  const [showAdditional, setShowAdditional] = useState(false);
  const [dynValues, setDynValues] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const plant = plants.find((p) => p.id === selectedPlantId);
  const plantInverters = inverters.filter(
    (inv) => inv.plantId === selectedPlantId,
  );

  // Reset dynamic fields when plant changes
  useEffect(() => {
    setDynValues({});
  }, [selectedPlantId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDynChange = (key, value) => {
    setDynValues((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlantChange = (e) => {
    onPlantChange(e.target.value);
    onInverterChange("");
  };

  const validate = () => {
    const errs = {};
    if (!selectedPlantId) errs.plant = "Select a plant";
    if (!selectedInverterId) errs.inverter = "Select an inverter";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    const payload = {
      plantId: selectedPlantId,
      inverterId: selectedInverterId,
      temperature: Number(form.temperature) || null,
      output: Number(form.output) || null,
      alarmCode: Number(form.alarmCode) || null,
      opState: form.opState || "",
      frequency: Number(form.frequency) || null,
      voltageAB: Number(form.voltageAB) || null,
      voltageBC: Number(form.voltageBC) || null,
      voltageCA: Number(form.voltageCA) || null,
      efficiency: Number(form.efficiency) || null,
      irradiance: Number(form.irradiance) || null,
      stringImbalance: Number(form.stringImbalance) || null,
      kwhToday: Number(form.kwhToday) || null,
      kwhTotal: Number(form.kwhTotal) || null,
      faultNotes: form.faultNotes || "",
      pvVoltages: Object.entries(dynValues)
        .filter(([k]) => k.startsWith("pv_voltage_"))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => Number(v) || 0),
      pvCurrents: Object.entries(dynValues)
        .filter(([k]) => k.startsWith("pv_current_"))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => Number(v) || 0),
      smuStrings: Object.entries(dynValues)
        .filter(([k]) => k.startsWith("string"))
        .map(([, v]) => Number(v) || 0),
    };

    try {
      await addTelemetry(payload);
      setSuccess(`Readings submitted for ${selectedInverterId}`);
      // Refresh inverter data to reflect new telemetry
      await refreshInvertersForPlant(selectedPlantId);
      setForm({
        temperature: "",
        output: "",
        alarmCode: "",
        opState: "",
        frequency: "",
        voltageAB: "",
        voltageBC: "",
        voltageCA: "",
        efficiency: "",
        irradiance: "",
        stringImbalance: "",
        kwhToday: "",
        kwhTotal: "",
        faultNotes: "",
      });
      setDynValues({});
    } catch (err) {
      setErrors({
        plant: err.response?.data?.message || "Failed to submit readings",
      });
    }
  };

  const inputCls = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[field] ? "border-red-400" : "border-gray-300"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plant
          </label>
          <select
            value={selectedPlantId}
            onChange={handlePlantChange}
            className={inputCls("plant")}
          >
            <option value="">Select a plant</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.plant && (
            <p className="mt-1 text-xs text-red-600">{errors.plant}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inverter
          </label>
          <select
            value={selectedInverterId}
            onChange={(e) => onInverterChange(e.target.value)}
            className={inputCls("inverter")}
            disabled={!selectedPlantId}
          >
            <option value="">Select an inverter</option>
            {plantInverters.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.id} — {inv.model}
              </option>
            ))}
          </select>
          {errors.inverter && (
            <p className="mt-1 text-xs text-red-600">{errors.inverter}</p>
          )}
        </div>
      </div>

      {/* Reading fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Inp
          label="Temperature (°C)"
          name="temperature"
          value={form.temperature}
          onChange={handleChange}
          cls={inputCls("temperature")}
          type="number"
        />
        <Inp
          label="Output (kW)"
          name="output"
          value={form.output}
          onChange={handleChange}
          cls={inputCls("output")}
          type="number"
        />
        <Inp
          label="Alarm Code"
          name="alarmCode"
          value={form.alarmCode}
          onChange={handleChange}
          cls={inputCls("alarmCode")}
          type="number"
        />
        <Inp
          label="Operational State"
          name="opState"
          value={form.opState}
          onChange={handleChange}
          cls={inputCls("opState")}
        />
      </div>

      {/* Button to show additional fields */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowAdditional(!showAdditional)}
          className="text-sm text-indigo-600 hover:text-indigo-800 underline"
        >
          {showAdditional
            ? "Hide Additional Readings"
            : "Show Additional Readings"}
        </button>
      </div>

      {/* Additional reading fields */}
      {showAdditional && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <Inp
            label="Frequency (Hz)"
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            cls={inputCls("frequency")}
            type="number"
          />
          <Inp
            label="Voltage AB (V)"
            name="voltageAB"
            value={form.voltageAB}
            onChange={handleChange}
            cls={inputCls("voltageAB")}
            type="number"
          />
          <Inp
            label="Voltage BC (V)"
            name="voltageBC"
            value={form.voltageBC}
            onChange={handleChange}
            cls={inputCls("voltageBC")}
            type="number"
          />
          <Inp
            label="Voltage CA (V)"
            name="voltageCA"
            value={form.voltageCA}
            onChange={handleChange}
            cls={inputCls("voltageCA")}
            type="number"
          />
          <Inp
            label="Efficiency (%)"
            name="efficiency"
            value={form.efficiency}
            onChange={handleChange}
            cls={inputCls("efficiency")}
            type="number"
          />
          <Inp
            label="Irradiance (W/m²)"
            name="irradiance"
            value={form.irradiance}
            onChange={handleChange}
            cls={inputCls("irradiance")}
            type="number"
          />
          <Inp
            label="String Imbalance (%)"
            name="stringImbalance"
            value={form.stringImbalance}
            onChange={handleChange}
            cls={inputCls("stringImbalance")}
            type="number"
          />
          <Inp
            label="kWh Today"
            name="kwhToday"
            value={form.kwhToday}
            onChange={handleChange}
            cls={inputCls("kwhToday")}
            type="number"
          />
          <Inp
            label="kWh Total"
            name="kwhTotal"
            value={form.kwhTotal}
            onChange={handleChange}
            cls={inputCls("kwhTotal")}
            type="number"
          />
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fault Notes
            </label>
            <textarea
              name="faultNotes"
              value={form.faultNotes}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter any fault notes..."
            />
          </div>
        </div>
      )}

      {/* Dynamic architecture fields */}
      {plant && (
        <div className="space-y-4 pt-2">
          <DynamicArchitectureFields
            prefix="pv_voltage_"
            count={plant.pvChannels}
            values={dynValues}
            onChange={handleDynChange}
          />
          <DynamicArchitectureFields
            prefix="pv_current_"
            count={plant.pvChannels}
            values={dynValues}
            onChange={handleDynChange}
          />
          <DynamicArchitectureFields
            prefix="string"
            count={plant.smuStrings}
            values={dynValues}
            onChange={handleDynChange}
          />
        </div>
      )}

      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Submit Readings
      </button>
    </form>
  );
}

function Inp({ label, name, value, onChange, cls, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={cls}
      />
    </div>
  );
}
