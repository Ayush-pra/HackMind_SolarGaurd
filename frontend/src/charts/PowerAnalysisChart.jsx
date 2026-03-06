import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { mockPowerData } from '../data/mockData';

export default function PowerAnalysisChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Power Analysis</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={mockPowerData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="actual"
            name="Actual Power (kW)"
            stroke="#6366f1"
            fill="#eef2ff"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            name="Forecast Power (kW)"
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
