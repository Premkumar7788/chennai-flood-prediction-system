import React, { useEffect, useState } from 'react';
import { useFloodStore } from '../store/floodStore';
import { History, Calendar, CloudRain, AlertOctagon } from 'lucide-react';
import RiskBadge from '../components/common/RiskBadge';

export default function HistoryPage() {
  const { history, loadAllData } = useFloodStore();

  useEffect(() => {
    if (!history.length) loadAllData();
  }, [history, loadAllData]);

  const majorFloods = [
    { year: '2015', label: 'Historic Chennai Floods (Dec)', depth: '120 cm max', rainfall: '34.5 cm / 24h', zones: 'Adyar, Velachery, Saidapet', impact: 'Submersion of arterial corridors; airport closure' },
    { year: '2021', label: 'Cyclone Nivar Inundation', depth: '60 cm max', rainfall: '18.2 cm / 24h', zones: 'T. Nagar, Kodambakkam', impact: 'Severe commercial district waterlogging' },
    { year: '2023', label: 'Cyclone Michaung', depth: '85 cm max', rainfall: '27.6 cm / 24h', zones: 'Perungudi, Velachery, Sholinganallur', impact: 'IT Corridor & southern basin cut-off' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Chennai Historical Flood Archive & Benchmarks
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Historical ground-truth records compiled from GEE Sentinel-1 SAR imagery and IMD meteorological stations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {majorFloods.map((f, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono font-bold">
                {f.year} Flood
              </span>
              <span className="text-[11px] text-slate-400">{f.rainfall}</span>
            </div>
            <h4 className="font-semibold text-slate-200 text-sm">{f.label}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.impact}</p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Worst Hit:</span>
              <span className="text-slate-300 font-medium">{f.zones}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          Cataloged Inundation Incidents
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Zone</th>
                <th className="p-3">Event Date</th>
                <th className="p-3">24h Rainfall</th>
                <th className="p-3">Max Depth</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history.map((h, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-semibold text-slate-100">{h.zoneName}</td>
                  <td className="p-3 font-mono text-slate-400">{h.floodDate}</td>
                  <td className="p-3 font-mono">{h.rainfall24hCm} cm</td>
                  <td className="p-3 font-mono text-blue-400">{h.maxFloodDepthCm} cm</td>
                  <td className="p-3">
                    <RiskBadge level={h.severity} />
                  </td>
                  <td className="p-3 text-slate-400 max-w-xs truncate">{h.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
