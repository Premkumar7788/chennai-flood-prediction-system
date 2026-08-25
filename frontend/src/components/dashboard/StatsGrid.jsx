import React from 'react';
import { CloudRain, Droplets, MapPin, Gauge } from 'lucide-react';

export default function StatsGrid({ totalZones, atRiskCount, avgRainfall, modelType = 'XGBoost v2.1' }) {
  const cards = [
    {
      title: 'Monitored Zones',
      value: totalZones || 15,
      sub: 'Greater Chennai Corp',
      icon: MapPin,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Zones At Risk',
      value: atRiskCount,
      sub: atRiskCount > 0 ? 'High/Critical risk levels' : 'All zones nominal',
      icon: Gauge,
      color: atRiskCount > 0 ? 'text-rose-400' : 'text-emerald-400',
      bg: atRiskCount > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Avg 24h Rainfall',
      value: `${avgRainfall || 14.8} cm`,
      sub: 'IMD Station telemetry',
      icon: CloudRain,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Inference Engine',
      value: 'XGBoost ML',
      sub: '12-feature spatial model',
      icon: Droplets,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-slate-400">{c.title}</p>
              <h4 className="text-2xl font-bold text-slate-100 mt-1">{c.value}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{c.sub}</p>
            </div>
            <div className={`p-3 rounded-xl border ${c.bg} ${c.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
