import React, { useEffect } from 'react';
import { useFloodStore } from '../store/floodStore';
import FloodMap from '../components/map/FloodMap';
import RiskBadge from '../components/common/RiskBadge';
import { formatProbability, getRecommendedAction } from '../utils/mapUtils';
import { X, Layers, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function MapPage() {
  const { zones, selectedZone, clearSelectedZone, loadAllData } = useFloodStore();

  useEffect(() => {
    if (!zones) loadAllData();
  }, [zones, loadAllData]);

  const p = selectedZone?.properties;

  return (
    <div className="h-[calc(100vh-7rem)] relative rounded-2xl overflow-hidden border border-slate-800 flex">
      <div className="flex-1 h-full relative">
        <FloodMap zones={zones} fullScreen={true} />
      </div>

      {selectedZone && (
        <div className="absolute top-4 left-4 z-[1000] w-84 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Zone Telemetry
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">{p?.zoneName || 'Chennai Zone'}</h3>
            </div>
            <button
              onClick={clearSelectedZone}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Risk Severity</span>
              <RiskBadge level={p?.riskLevel} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Flood Inundation Probability</span>
              <span className="font-semibold text-slate-100 font-mono">
                {formatProbability(p?.floodProbability)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ward Number</span>
              <span className="font-medium text-slate-200">{p?.wardNumber || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mean Elevation (DEM)</span>
              <span className="font-medium text-slate-200">{p?.avgElevationM || 4.5} m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Drainage Capacity</span>
              <span className="font-medium text-slate-200">{p?.drainageCapacity || 'MEDIUM'}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Recommended Protocol
            </p>
            <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
              {getRecommendedAction(p?.riskLevel)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
