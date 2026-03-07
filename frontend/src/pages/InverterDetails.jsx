import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { generateAIAnalysis, getRiskTrend } from "../api/inverterApi";
import RiskGauge from "../components/RiskGauge";
import SensorCard from "../components/SensorCard";
import FaultList from "../components/FaultList";
import RiskTrendChart from "../charts/RiskTrendChart"; // bar chart for top features

const TABS = ["Top Features", "Sensor Data", "AI Analysis"];

export default function InverterDetails() {
  const { inverterId } = useParams();
  const { inverters, plants } = useAppContext();
  const [activeTab, setActiveTab] = useState("Top Features");
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [topFeaturesData, setTopFeaturesData] = useState(null); // holds top features now

  const inverter = inverters.find((inv) => inv.id === inverterId);
  const plant = inverter ? plants.find((p) => p.id === inverter.plantId) : null;
  const faults = inverter?.faults || [];

  if (!inverter) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">
          Inverter "{inverterId}" not found.
        </p>
        <Link
          to="/dashboard"
          className="text-indigo-600 hover:underline text-sm mt-2 inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      const data = await generateAIAnalysis(inverterId);
      setAiData(data);
    } catch (err) {
      console.error("AI analysis failed:", err);
      setAiData(null);
    } finally {
      setAiLoading(false);
    }
  };

  const sensorStatus = (val, low, high) =>
    val <= low || val >= high
      ? "Critical"
      : val <= low * 1.1 || val >= high * 0.9
        ? "Warning"
        : "Normal";

  useEffect(() => {
    if (activeTab === "Top Features" && !topFeaturesData) {
      fetchRiskTrend();
    }
  }, [activeTab]);

  const fetchRiskTrend = async () => {
    try {
      const data = await getRiskTrend(inverterId);
      // Use topFeatures from prediction for the chart
      // Assume data includes topFeatures: [{ feature, value, reason }]
      const transformed = data.topFeatures
        ? data.topFeatures.map((item) => ({
            feature: item.feature,
            value: item.value,
            reason: item.reason,
          }))
        : [];
      setTopFeaturesData(transformed);
    } catch (err) {
      console.error("Failed to fetch risk trend:", err);
      setTopFeaturesData([]); // Set to empty array to show empty chart
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-indigo-600">
          Dashboard
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800 font-medium">{inverterId}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Gauge */}
          <RiskGauge
            score={inverter.riskScore}
            label={inverter.riskLabel}
            size={140}
          />

          {/* Info */}
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {plant?.name} — {inverter.id}
            </h2>
            <p className="text-sm text-gray-500">{inverter.model}</p>

            <div className="flex flex-wrap gap-4 mt-3">
              <InfoChip label="Risk Score" value={`${inverter.riskScore}%`} />
              <InfoChip label="Status" value={inverter.riskLabel} />
              <InfoChip label="Days to Event" value={7} />
              <InfoChip label="Trend" value={inverter.riskTrend} />
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <SensorCard
          label="Heat Sink Temp"
          value={inverter.temperature}
          unit="°C"
          status={sensorStatus(inverter.temperature, 30, 75)}
          threshold="< 75°C"
        />
        {/* <SensorCard
          label="Efficiency"
          value={inverter.efficiency}
          unit="%"
          status={sensorStatus(inverter.efficiency, 90, 200)}
          threshold="> 90%"
        /> */}
        <SensorCard
          label="AC Output"
          value={inverter.output}
          unit="kW"
          status="Normal"
          threshold="Rated capacity"
        />
        {/* <SensorCard
          label="DC Voltage"
          value={inverter.dcVoltage}
          unit="V"
          status={sensorStatus(inverter.dcVoltage, 500, 850)}
          threshold="500–850 V"
        />
        <SensorCard
          label="Irradiance"
          value={inverter.irradiance}
          unit="W/m²"
          status="Normal"
          threshold="Varies"
        />
        <SensorCard
          label="String Imbalance"
          value={inverter.stringImbalance}
          unit="%"
          status={sensorStatus(inverter.stringImbalance, -1, 3)}
          threshold="< 3%"
        /> */}
      </div>

      {/* Active Faults */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Active Fault Codes
        </h3>
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
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5">
          {activeTab === "Top Features" && (
            <RiskTrendChart data={topFeaturesData} />
          )}
          {activeTab === "Sensor Data" && (
            <SensorDataGrid inverter={inverter} />
          )}
          {activeTab === "AI Analysis" && (
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
    { label: "Temperature", value: `${inverter.temperature} °C` },
    { label: "Frequency", value: `${inverter.frequency} Hz` },
    { label: "Voltage AB", value: `${inverter.voltageAB} V` },
    { label: "Voltage BC", value: `${inverter.voltageBC} V` },
    { label: "Voltage CA", value: `${inverter.voltageCA} V` },
    { label: "DC Voltage", value: `${inverter.dcVoltage} V` },
    { label: "Output", value: `${inverter.output} kW` },
    { label: "Efficiency", value: `${inverter.efficiency}%` },
    { label: "Irradiance", value: `${inverter.irradiance} W/m²` },
    { label: "String Imbalance", value: `${inverter.stringImbalance}%` },
    { label: "kWh Today", value: inverter.kwhToday },
    { label: "kWh Total", value: inverter.kwhTotal?.toLocaleString() },
    { label: "Operating State", value: inverter.operatingState },
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
        <h4 className="text-lg font-semibold text-gray-800">
          AI Analysis Ready
        </h4>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Get the pre-computed AI-powered risk analysis for this inverter.
        </p>
        <button
          onClick={onGenerate}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Get Analysis
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500">Fetching analysis data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormattedAnalysis summary={data.failureSummary} />
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

function FormattedAnalysis({ summary }) {
  // Remove the title if present
  const cleanedSummary = summary.replace(
    /\*\*Inverter Failure Analysis and Recommendations\*\*\s*/,
    "",
  );

  // Split into sections based on patterns
  const lines = cleanedSummary.split("\n").filter((line) => line.trim());

  const sections = [];
  let currentSection = { title: "", content: [] };

  lines.forEach((line) => {
    if (line.startsWith("**Recommended Actions:**")) {
      if (currentSection.title) sections.push(currentSection);
      currentSection = { title: "Recommended Actions", content: [] };
    } else if (line.match(/^\d+\.\s\*\*/)) {
      // Numbered items
      currentSection.content.push({ type: "numbered", text: line });
    } else if (line.startsWith("* **")) {
      // Bullet points
      currentSection.content.push({ type: "bullet", text: line });
    } else if (line.startsWith("Based on") || line.startsWith("Considering")) {
      if (currentSection.title) sections.push(currentSection);
      currentSection = {
        title: "Analysis",
        content: [{ type: "paragraph", text: line }],
      };
    } else {
      currentSection.content.push({ type: "paragraph", text: line });
    }
  });

  if (currentSection.title) sections.push(currentSection);

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => (
        <Section key={idx} title={section.title}>
          <div className="space-y-3">
            {section.content.map((item, i) => {
              if (item.type === "numbered") {
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-indigo-600 font-semibold">
                      {item.text.split(".")[0]}.
                    </span>
                    <p
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: item.text
                          .substring(item.text.indexOf(".") + 1)
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                      }}
                    />
                  </div>
                );
              } else if (item.type === "bullet") {
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-indigo-600">•</span>
                    <p
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: item.text.replace(
                          /\*\*(.*?)\*\*/g,
                          "<strong>$1</strong>",
                        ),
                      }}
                    />
                  </div>
                );
              } else {
                return (
                  <p
                    key={i}
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: item.text.replace(
                        /\*\*(.*?)\*\*/g,
                        "<strong>$1</strong>",
                      ),
                    }}
                  />
                );
              }
            })}
          </div>
        </Section>
      ))}
    </div>
  );
}
