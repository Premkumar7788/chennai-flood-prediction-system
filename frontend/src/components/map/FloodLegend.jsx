import React from 'react';
import { RISK_COLORS } from '../../utils/constants';

export default function FloodLegend() {
  const items = [
    { label: 'Low (< 35%)', color: RISK_COLORS.LOW, desc: 'Normal conditions' },
    { label: 'Moderate (35-55%)', color: RISK_COLORS.MODERATE, desc: 'Waterlogging potential' },
    { label: 'High (55-75%)', color: RISK_COLORS.HIGH, desc: 'Significant flooding' },
    { label: 'Critical (> 75%)', color: RISK_COLORS.CRITICAL, desc: 'Severe inundation' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 backdrop-blur-md shadow-xl text-slate-200">
      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2.5">
        Flood Risk Severity
      </h4>
      <div className="space-y-2 text-xs">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-sm shrink-0 shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex flex-col">
              <span className="font-medium text-slate-200">{item.label}</span>
              <span className="text-[10px] text-slate-400">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
