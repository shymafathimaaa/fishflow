import React from 'react';
import { getOrders } from '../services/store';
import { Order } from '../types';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/common/StatusBadge';
import { Clock, ArrowRight, Fish } from 'lucide-react';

export const RecentOrders: React.FC = () => {
  const orders: Order[] = getOrders();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recent Market Tokens</h1>
        <p className="text-sm text-slate-600">View and track all recently placed fish market tokens.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="divide-y divide-slate-100">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Fish className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">No active tokens in store</p>
              <Link to="/" className="inline-block text-xs text-brand-600 font-bold hover:underline">
                Place a new pre-order →
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
                      {order.token}
                    </span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 pt-1">
                    {order.customerName} · {order.totalWeightKg} kg
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {order.items.map(i => `${i.fishName} (${i.preparation})`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-slate-400 block">Est Wait</span>
                    <span className="font-bold text-slate-900">~{order.estimatedWaitMinutes} min</span>
                  </div>

                  <Link
                    to={`/track/${order.token}`}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
