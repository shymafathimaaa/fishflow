import React from 'react';
import { MarketMetrics } from '../../types';
import { BarChart3, PieChart, TrendingUp, Award, Clock, Scissors, Info } from 'lucide-react';

interface MarketInsightsProps {
  metrics: MarketMetrics;
}

export const MarketInsights: React.FC<MarketInsightsProps> = ({ metrics }) => {
  const prepDistribution = [
    { name: 'Cut + Cleaned', percentage: 52, color: 'bg-brand-500' },
    { name: 'Cleaned', percentage: 28, color: 'bg-teal-500' },
    { name: 'Cut', percentage: 14, color: 'bg-amber-500' },
    { name: 'Whole', percentage: 6, color: 'bg-slate-400' },
  ];

  const hourlyThroughput = [
    { hour: '7 AM', orders: 12, height: 'h-8' },
    { hour: '8 AM', orders: 28, height: 'h-16' },
    { hour: '9 AM', orders: 45, height: 'h-28' },
    { hour: '10 AM', orders: 62, height: 'h-36' }, // Peak
    { hour: '11 AM', orders: 38, height: 'h-24' },
    { hour: '12 PM', orders: 20, height: 'h-12' },
  ];

  return (
    <div id="insights" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-soft">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Market Operational Insights</h3>
            <p className="text-xs text-slate-500">Real-time throughput metrics & prep demand breakdown</p>
          </div>
        </div>

        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          Demo Operational Metrics
        </span>
      </div>

      {/* Grid 1: 4 Key Indicator Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-1">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <span>Peak Queue Size</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.peakQueueSize} orders
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Recorded at 10:15 AM</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-1">
            <Scissors className="w-4 h-4 text-teal-600" />
            <span>Top Preparation</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 truncate">
            {metrics.mostPopularPrep}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">52% of customer orders</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Avg Prep Duration</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.averagePrepTimeMinutes} mins
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Per 1.5 kg selection</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-1">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Orders Completed</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.completedCount + 24} orders
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">+14% vs yesterday</span>
        </div>
      </div>

      {/* Grid 2: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Chart 1: Hourly Order Volume */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              <span>Morning Peak Order Volume (Orders/Hr)</span>
            </h4>
            <p className="text-xs text-slate-500">Hourly queue arrival distribution observed during peak market hours</p>
          </div>

          <div className="flex items-end justify-between gap-3 pt-8 pb-2 px-2">
            {hourlyThroughput.map((item) => (
              <div key={item.hour} className="flex flex-col items-center gap-2 flex-1 group">
                <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.orders}
                </span>
                <div
                  className={`w-full max-w-[36px] bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${item.height}`}
                />
                <span className="text-[11px] font-bold text-slate-500">{item.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Preparation Preference Breakdown */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-teal-600" />
              <span>Preparation Requirements Share</span>
            </h4>
            <p className="text-xs text-slate-500">Percentage distribution of cutting/cleaning choices selected by customers</p>
          </div>

          <div className="space-y-3.5 my-4">
            {prepDistribution.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{item.name}</span>
                  <span className="text-slate-600 font-extrabold">{item.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 italic">
            * Cut + Cleaned remains the most labor-intensive choice, directly impacting queue wait duration predictions.
          </p>
        </div>
      </div>
    </div>
  );
};
