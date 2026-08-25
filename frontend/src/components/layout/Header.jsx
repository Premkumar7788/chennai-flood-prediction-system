import React from 'react';
import { Bell, Clock, ShieldCheck } from 'lucide-react';
import { useFloodStore } from '../../store/floodStore';

export default function Header() {
  const { alertZones, lastUpdated } = useFloodStore();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/30 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Greater Chennai Corporation Surveillance</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
          </span>
        </div>

        <div className="relative">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <Bell className="w-4 h-4" />
          </div>
          {alertZones.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
              {alertZones.length}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
