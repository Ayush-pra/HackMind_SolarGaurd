import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mockFaults, mockAIAnalysis } from '../data/mockData';
import RiskGauge from '../components/RiskGauge';
import SensorCard from '../components/SensorCard';
import FaultList from '../components/FaultList';
import RiskTrendChart from '../charts/RiskTrendChart';
import PowerAnalysisChart from '../charts/PowerAnalysisChart';

const TABS = ['Risk Trend', 'Power Analysis', 'Sensor Data', 'AI Analysis'];

export default function InverterDetails() {
  const { inverterId } = useParams();
  const { inverters, plants } = useAppContext();
  const [activeTab, setActiveTab] = useState('Risk Trend');
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const inverter = inverters.find((inv) => inv.id === inverterId);
  const plant = inverter ? plants.find((p) => p.id === inverter.plantId) : null;
  const faults = mockFaults[inverterId] || [];

  if (!inverter) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Inverter "{inverterId}" not found.</p>
        <Link to="/dashboard" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleGenerateAI = () => {
    setAiLoading(true);
    // Placeholder — replace with generateAIAnalysis(inverterId) call
    setTimeout(() => {
      setAiData(mockAIAnalysis);
      setAiLoading(false);
    }, 1500);
  };

  const sensorStatus = (val, low, high) =>
    val <= low || val >= high ? 'Critical' : val <= low * 1.1 || val >= high * 0.9 ? 'Warning' : 'Normal';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800 font-medium">{inverterId}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Gauge */}
          <RiskGauge score={inverter.riskScore} label={inverter.riskLabel} size={140} />

          {/* Info */}
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {plant?.name} — {inverter.id}
            </h2>
            <p className="text-sm text-gray-500">{inverter.model}</p>

            <div className="flex flex-wrap gap-4 mt-3">
              <InfoChip label="Risk Score" value={`${inverter.riskScore}%`} />
              <InfoChip label="Status" value={inverter.riskLabel} />
              <InfoChip label="Days to Event" value={inverter.daysToEvent} />
              <InfoChip label="Trend" value={inverter.riskTrend} />
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <SensorCard label="Heat Sink Temp" value={inverter.temperature} unit="°C" status={sensorStatus(inverter.temperature, 30, 75)} threshold="< 75°C" />
        <SensorCard label="Efficiency" value={inverter.efficiency} unit="%" status={sensorStatus(inverter.efficiency, 90, 200)} threshold="> 90%" />
        <SensorCard label="AC Output" value={inverter.output} unit="kW" status="Normal" threshold="Rated capacity" />
        <SensorCard label="DC Voltage" value={inverter.dcVoltage} unit="V" status={sensorStatus(inverter.dcVoltage, 500, 850)} threshold="500–850 V" />
        <SensorCard label="Irradiance" value={inverter.irradiance} unit="W/m²" status="Normal" threshold="Varies" />
        <SensorCard label="String Imbalance" value={inverter.stringImbalance} unit="%" status={sensorStatus(inverter.stringImbalance, -1, 3)} threshold="< 3%" />
      </div>

      {/* Active Faults */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Fault Codes</h3>
        <FaultList faults={faults} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-5">
          <nav className="flex gap-6 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5">
          {activeTab === 'Risk Trend' && <RiskTrendChart />}
          {activeTab === 'Power Analysis' && <PowerAnalysisChart />}
          {activeTab === 'Sensor Data' && <SensorDataGrid inverter={inverter} />}
          {activeTab === 'AI Analysis' && (
            <AIAnalysisTab
              data={aiData}
              loading={aiLoading}
              onGenerate={handleGenerateAI}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function InfoChip({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
    </div>
  );
}

function SensorDataGrid({ inverter }) {
  const items = [
    { label: 'Temperature', value: `${inverter.temperature} °C` },
    { label: 'Frequency', value: `${inverter.frequency} Hz` },
    { label: 'Voltage AB', value: `${inverter.voltageAB} V` },
    { label: 'Voltage BC', value: `${inverter.voltageBC} V` },
    { label: 'Voltage CA', value: `${inverter.voltageCA} V` },
    { label: 'DC Voltage', value: `${inverter.dcVoltage} V` },
    { label: 'Output', value: `${inverter.output} kW` },
    { label: 'Efficiency', value: `${inverter.efficiency}%` },
    { label: 'Irradiance', value: `${inverter.irradiance} W/m²` },
    { label: 'String Imbalance', value: `${inverter.stringImbalance}%` },
    { label: 'kWh Today', value: inverter.kwhToday },
    { label: 'kWh Total', value: inverter.kwhTotal?.toLocaleString() },
    { label: 'Operating State', value: inverter.operatingState },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-gray-50 rounded-lg px-4 py-3">
          <p className="text-xs text-gray-500">{item.label}</p>
          <p className="text-sm font-semibold text-gray-800">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function AIAnalysisTab({ data, loading, onGenerate }) {
  if (!data && !loading) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">🧠</div>
        <h4 className="text-lg font-semibold text-gray-800">AI Analysis Ready</h4>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Generate a comprehensive AI-powered risk analysis for this inverter.
        </p>
        <button
          onClick={onGenerate}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Generate Analysis
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500">Analyzing inverter data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Section title="Executive Summary">
        <p className="text-sm text-gray-700 leading-relaxed">{data.executiveSummary}</p>
      </Section>

      {/* Root-Cause Hypotheses */}
      <Section title="Root-Cause Hypotheses">
        <div className="space-y-3">
          {data.rootCauseHypotheses.map((h, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-sm font-semibold text-gray-800">{h.title}</h5>
                <span className="text-xs font-medium text-indigo-600">{h.confidence}% confidence</span>
              </div>
              <p className="text-sm text-gray-600">{h.detail}</p>
              <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full">
                <div className="h-1.5 bg-indigo-500 rounded-full transition-all" style={{ width: `${h.confidence}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Operational & Financial Impact */}
      <Section title="Operational & Financial Impact">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ImpactCard label="Energy Loss" value={data.operationalImpact.energyLoss} />
          <ImpactCard label="Financial Impact" value={data.operationalImpact.financialImpact} />
          <ImpactCard label="Cascade Risk" value={data.operationalImpact.cascadeRisk} />
        </div>
      </Section>

      {/* Predicted Failure Timeline */}
      <Section title="Predicted Failure Timeline">
        <div className="space-y-2">
          {data.failureTimeline.map((f, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-xs font-semibold text-gray-500 w-24">{f.timeframe}</span>
              <span className="flex-1 text-sm text-gray-700">{f.event}</span>
              <span className="text-xs font-bold text-red-600">{f.probability}%</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Recommended Action Plan */}
      <Section title="Recommended Action Plan">
        <div className="space-y-2">
          {data.recommendedActions.map((a, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                  a.priority === 'Immediate'
                    ? 'bg-red-100 text-red-700'
                    : a.priority === 'Short-term'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {a.priority}
              </span>
              <span className="text-sm text-gray-700">{a.action}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Overall Confidence */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-indigo-800">Overall Analysis Confidence</h4>
          <span className="text-lg font-bold text-indigo-700">{data.overallConfidence}%</span>
        </div>
        <div className="h-2.5 w-full bg-indigo-200 rounded-full">
          <div className="h-2.5 bg-indigo-600 rounded-full transition-all" style={{ width: `${data.overallConfidence}%` }} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-800 mb-3">{title}</h4>
      {children}
    </div>
  );
}

function ImpactCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
