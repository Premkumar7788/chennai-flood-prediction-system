import React, { useEffect } from 'react';
import { useFloodStore } from '../store/floodStore';
import StatsGrid from '../components/dashboard/StatsGrid';
import AlertBanner from '../components/dashboard/AlertBanner';
import RainfallBarChart from '../components/charts/RainfallBarChart';
import RiskDonutChart from '../components/charts/RiskDonutChart';
import FloodMap from '../components/map/FloodMap';

export default function DashboardPage() {
  const { zones, rainfall, alertZones, loadAllData } = useFloodStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const totalZones = zones?.features?.length || 15;
  const atRiskCount = alertZones?.length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Chennai Urban Flood Dashboard</h2>
        <p className="text-xs text-slate-400 mt-1">
          Continuous hydrological sensing, topography analytics, and predictive inundation modeling.
        </p>
      </div>

      <AlertBanner alertZones={alertZones} />

      <StatsGrid
        totalZones={totalZones}
        atRiskCount={atRiskCount}
        avgRainfall={
          rainfall.length > 0
            ? (rainfall.reduce((acc, r) => acc + (r.rainfall24hCm || 0), 0) / rainfall.length).toFixed(1)
            : 16.4
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Live Spatial Inundation Overview</h3>
                <p className="text-xs text-slate-400">Classified ward boundaries</p>
              </div>
            </div>
            <div className="flex-1 min-h-[340px]">
              <FloodMap zones={zones} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <RiskDonutChart zones={zones} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RainfallBarChart rainfallData={rainfall} />
      </div>
    </div>
  );
}
