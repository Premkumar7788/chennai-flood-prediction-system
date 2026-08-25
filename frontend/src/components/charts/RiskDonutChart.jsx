import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RISK_COLORS } from '../../utils/constants';

export default function RiskDonutChart({ zones }) {
  const counts = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };

  if (zones?.features) {
    zones.features.forEach((f) => {
      const risk = (f.properties?.riskLevel || 'LOW').toUpperCase();
      if (counts[risk] !== undefined) counts[risk]++;
    });
  } else {
    counts.LOW = 4;
    counts.MODERATE = 3;
    counts.HIGH = 5;
    counts.CRITICAL = 3;
  }

  const data = [
    { name: 'Low', value: counts.LOW, color: RISK_COLORS.LOW },
    { name: 'Moderate', value: counts.MODERATE, color: RISK_COLORS.MODERATE },
    { name: 'High', value: counts.HIGH, color: RISK_COLORS.HIGH },
    { name: 'Critical', value: counts.CRITICAL, color: RISK_COLORS.CRITICAL },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm h-80 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Spatial Risk Distribution</h3>
          <p className="text-xs text-slate-400">Total Classified Zones</p>
        </div>
      </div>

      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#f8fafc',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-100">
            {Object.values(counts).reduce((a, b) => a + b, 0)}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Zones</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span>{d.name}:</span>
            <span className="font-semibold text-slate-100">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
