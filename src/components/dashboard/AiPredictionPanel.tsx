import React from 'react';
import { Cpu, Users, Layers, Scale, Sparkles, Sliders, Activity, Info, Zap } from 'lucide-react';
import { MarketMetrics } from '../../types';

interface AiPredictionPanelProps {
  metrics: MarketMetrics;
  onWorkerCountChange: (count: number) => void;
}

export const AiPredictionPanel: React.FC<AiPredictionPanelProps> = ({
  metrics,
  onWorkerCountChange,
}) => {
  const getCapacityLabel = (workers: number) => {
    if (workers >= 8) return { text: 'High Staff Capacity', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (workers >= 5) return { text: 'Optimal Field Base (6 Workers)', color: 'bg-teal-100 text-teal-800 border-teal-200' };
    return { text: 'Reduced Counter Staff', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  };

  const capacity = getCapacityLabel(metrics.activeWorkers);
  const calculatedThroughputKg = (metrics.activeWorkers * 1.4).toFixed(1);

  return (
    <div id="ai-panel" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-soft">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>AI Queue Prediction Engine</span>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-teal-200">
                PROTOTYPE MODEL
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dynamic workload estimation & staff throughput scaling module
            </p>
          </div>
        </div>

        {/* Prediction Accuracy Feedback Loop Metric */}
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">Model Accuracy</span>
            <span className="text-lg font-extrabold text-teal-400">{metrics.predictionAccuracyPercent}%</span>
          </div>
          <Activity className="w-5 h-5 text-teal-400 animate-pulse" />
        </div>
      </div>

      {/* AI Explanation Banner */}
      <div className="bg-brand-50/80 border border-brand-200/80 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-brand-900 block font-semibold mb-0.5">How Prediction Works:</strong>
          The prediction layer estimates preparation/waiting time using current queue conditions, order quantity, preparation type complexity (Whole vs Cut vs Cleaned), active counter staff availability, and historical processing durations.
        </div>
      </div>

      {/* Grid of Real-Time Model Factors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Avg Predicted Wait */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Predicted Avg Wait</span>
            <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
              <span>~{metrics.averageWaitMinutes}</span>
              <span className="text-xs font-medium text-slate-500">mins</span>
            </div>
          </div>
          <span className="text-[11px] text-brand-600 font-bold mt-2 block">Live queue estimate</span>
        </div>

        {/* Metric 2: Queue Workload */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Queue Backlog</span>
            <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
              <span>{metrics.waitingCount + metrics.preparingCount}</span>
              <span className="text-xs font-medium text-slate-500">orders</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-2 block">
            {metrics.waitingCount} waiting · {metrics.preparingCount} preparing
          </span>
        </div>

        {/* Metric 3: Active Worker Simulation Control */}
        <div className="bg-gradient-to-br from-brand-50 to-teal-50 p-4 rounded-2xl border border-brand-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 uppercase tracking-wider">Active Staff Counters</span>
              <Sliders className="w-4 h-4 text-brand-600" />
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-brand-700">{metrics.activeWorkers} Workers</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${capacity.color}`}>
                {capacity.text}
              </span>
            </div>

            {/* Slider input */}
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="12"
                value={metrics.activeWorkers}
                onChange={(e) => onWorkerCountChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-brand-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <span className="text-xs font-black text-brand-800 bg-white px-2 py-0.5 rounded border border-brand-200">
                {metrics.activeWorkers}
              </span>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-brand-700 font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Est. processing speed: ~{calculatedThroughputKg} kg/min</span>
          </div>
        </div>
      </div>

      {/* Model Pluggability Disclaimer Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Pluggable Architecture: Heuristic logic is isolated in <code className="bg-slate-100 text-slate-700 px-1 rounded font-mono">ai/waitTimePrediction.ts</code>
        </span>
        <span className="font-semibold text-slate-500">Ready for Machine-Learning Model API Swap</span>
      </div>
    </div>
  );
};
