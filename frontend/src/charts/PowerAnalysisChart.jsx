import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PowerAnalysisChart({ data }) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Risk Analysis
        </h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading risk analysis data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Risk Analysis
        </h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No risk data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Risk Analysis
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="historical"
            name="Historical Risk"
            stroke="#6366f1"
            fill="#eef2ff"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            name="Forecast Risk"
            stroke="#22c55e"
            fill="#f0fdf4"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
