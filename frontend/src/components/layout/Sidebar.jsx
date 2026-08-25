import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Sparkles, History, Info } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Live Flood Map', path: '/map', icon: Map },
  { name: 'ML Prediction', path: '/predict', icon: Sparkles },
  { name: 'Historical Floods', path: '/history', icon: History },
  { name: 'About System', path: '/about', icon: Info },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-xl flex flex-col shrink-0 hidden md:flex">
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold">
          🌊
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-sm tracking-wide">Chennai Flood</h1>
          <p className="text-[11px] text-slate-400">Prediction & Warning</p>
        </div>
      </div>

      <nav className="p-4 space-y-1.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Model Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="font-mono text-[11px] text-slate-300">XGBoost & PostGIS</p>
          <p className="text-[10px] text-slate-500 mt-1">Telemetry Live (60s poll)</p>
        </div>
      </div>
    </aside>
  );
}
