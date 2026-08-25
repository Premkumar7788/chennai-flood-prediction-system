import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function RainfallBarChart({ rainfallData = [] }) {
  const chartData = (rainfallData && rainfallData.length > 0 ? rainfallData : [
    { zoneName: 'Adyar', rainfall1hCm: 4.2, rainfall24hCm: 18.5 },
    { zoneName: 'Velachery', rainfall1hCm: 6.8, rainfall24hCm: 26.4 },
    { zoneName: 'T. Nagar', rainfall1hCm: 3.1, rainfall24hCm: 12.2 },
    { zoneName: 'Mylapore', rainfall1hCm: 1.8, rainfall24hCm: 7.4 },
    { zoneName: 'Anna Nagar', rainfall1hCm: 1.2, rainfall24hCm: 5.5 },
    { zoneName: 'Saidapet', rainfall1hCm: 4.9, rainfall24hCm: 19.8 },
    { zoneName: 'Perungudi', rainfall1hCm: 5.9, rainfall24hCm: 22.1 }
  ]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm h-80 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Precipitation Telemetry</h3>
          <p className="text-xs text-slate-400">24-Hour Rainfall by Zone (cm)</p>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
          Live Radar
        </span>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="zoneName"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-25}
              textAnchor="end"
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#f8fafc',
              }}
            />
            <Bar dataKey="rainfall24hCm" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.rainfall24hCm > 20 ? '#ef4444' : entry.rainfall24hCm > 10 ? '#f59e0b' : '#38bdf8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
