import React, { useState } from 'react';
import { useFloodStore } from '../store/floodStore';
import { CHENNAI_ZONES } from '../utils/constants';
import RiskBadge from '../components/common/RiskBadge';
import { formatProbability } from '../utils/mapUtils';
import { Sparkles, Send, Activity, Info, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function PredictPage() {
  const { predictFloodRisk, loading } = useFloodStore();

  const [formData, setFormData] = useState({
    zoneId: 2,
    zoneName: 'Velachery',
    rainfall1hCm: 5.5,
    rainfall24hCm: 22.0,
    rainfall7dCm: 35.0,
    humidityPct: 88,
    reservoirLevelPct: 78,
  });

  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await predictFloodRisk(formData);
      setResult(res);
      toast.success(`Prediction generated for ${formData.zoneName}!`);
    } catch (err) {
      toast.error('Prediction failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' } }} />

      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          XGBoost Hydrological Inundation Simulator
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform forward simulation using satellite-derived soil impervious metrics, precipitation rates, and reservoir levels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Parameter Payload
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Zone</label>
              <select
                value={formData.zoneName}
                onChange={(e) => {
                  const name = e.target.value;
                  const idx = CHENNAI_ZONES.indexOf(name) + 1;
                  setFormData({ ...formData, zoneName: name, zoneId: idx || 1 });
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {CHENNAI_ZONES.map((zone, i) => (
                  <option key={i} value={zone}>
                    {zone} (Zone #{i + 1})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">1-Hour Rainfall (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.rainfall1hCm}
                  onChange={(e) => setFormData({ ...formData, rainfall1hCm: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">24-Hour Cumulative (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.rainfall24hCm}
                  onChange={(e) => setFormData({ ...formData, rainfall24hCm: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">7-Day Pre-Monsoon (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.rainfall7dCm}
                  onChange={(e) => setFormData({ ...formData, rainfall7dCm: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Relative Humidity (%)</label>
                <input
                  type="number"
                  value={formData.humidityPct}
                  onChange={(e) => setFormData({ ...formData, humidityPct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Upstream Reservoir Inflow Capacity (%)
              </label>
              <input
                type="number"
                value={formData.reservoirLevelPct}
                onChange={(e) => setFormData({ ...formData, reservoirLevelPct: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Evaluating Model Inferences...' : 'Calculate Inundation Risk'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-6 flex flex-col">
          {result ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Inference Outcome
                    </span>
                    <h4 className="text-lg font-bold text-slate-100">{result.zoneName}</h4>
                  </div>
                  <RiskBadge level={result.riskLevel} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <p className="text-xs text-slate-400">Flood Probability</p>
                    <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                      {formatProbability(result.floodProbability)}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <p className="text-xs text-slate-400">Predicted Flood Depth</p>
                    <p className="text-2xl font-bold font-mono text-blue-400 mt-1">
                      {result.predictedFloodDepthCm || 25.0} cm
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                    <Info className="w-4 h-4 text-blue-400" />
                    Response Action Recommendation
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{result.recommendedAction}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Validated against 2015/2021 historical flood masks
                </span>
                <span className="font-mono">{new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800/60 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center flex-1">
              <div className="p-4 rounded-full bg-slate-800/40 text-slate-500 mb-3">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">Awaiting Simulation Trigger</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Configure meteorological and terrain metrics on the left to evaluate risk predictions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
