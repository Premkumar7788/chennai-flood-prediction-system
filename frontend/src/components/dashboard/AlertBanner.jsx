import React from 'react';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import RiskBadge from '../common/RiskBadge';

export default function AlertBanner({ alertZones = [] }) {
  if (!alertZones.length) return null;

  return (
    <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 mb-6 backdrop-blur-sm shadow-lg shadow-rose-950/20">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 mt-0.5 animate-pulse">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-rose-200">
              Active Flood Warning ({alertZones.length} Zones Affected)
            </h3>
            <span className="text-xs text-rose-400 font-mono">Live Monitoring</span>
          </div>
          <p className="text-xs text-rose-300/80 mt-1">
            Elevated water saturation and active precipitation detected in low-elevation wards. Disaster management advisory active.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {alertZones.map((zone, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-200"
              >
                <span className="font-medium">{zone.properties?.zoneName || `Zone #${zone.id}`}</span>
                <RiskBadge level={zone.properties?.riskLevel} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
