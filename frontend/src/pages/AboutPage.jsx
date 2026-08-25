import React from 'react';
import { Info, Database, Cpu, Globe2, Layers, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-400" />
          System Architecture & Methodological Framework
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Technical specifications of the Chennai Street-Level Flood Prediction and Early Warning Platform.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-purple-400" />
            Machine Learning Pipeline (XGBoost)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The prediction engine uses a supervised <strong>XGBoost classifier</strong> trained on multi-temporal SAR satellite imagery
            (Sentinel-1), Shuttle Radar Topography Mission (SRTM) Digital Elevation Models, and high-density historical rainfall logs
            from NASA POWER and IMD archives across Chennai's 15 administrative zones.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {[
              '1-Hour Rainfall (cm)',
              '24-Hour Rainfall (cm)',
              '7-Day Pre-Monsoon Moisture',
              'DEM Mean Elevation (m)',
              'Impervious Surface %',
              'Distance to Coast/River (km)',
              'Stormwater Drain Index',
              'Underpass Indicator',
              'Monsoon Seasonality Flag'
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-cyan-400" />
            Spatial Data Engine (PostGIS & PostgreSQL)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Zone geometries and street corridors are mapped using standard EPSG:4326 WGS84 coordinates. PostGIS enables sub-second spatial
            queries, intersecting localized precipitation spikes with street vulnerability contours.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-blue-400" />
            Frontend & Visual Telemetry
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Built with <strong>React 18</strong>, <strong>Vite</strong>, <strong>Tailwind CSS</strong>, <strong>React-Leaflet</strong>, and <strong>Recharts</strong>.
            State synchronization is driven by <strong>Zustand</strong> with reactive 60-second polling against the Spring Boot REST API.
          </p>
        </div>
      </div>
    </div>
  );
}
