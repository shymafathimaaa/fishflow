import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Search, Play, CheckCircle2, CheckCheck, Clock, User, QrCode, Filter } from 'lucide-react';

interface QueueTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onSearchToken?: (token: string) => void;
}

export const QueueTable: React.FC<QueueTableProps> = ({
  orders,
  onStatusChange,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter orders based on status tab and search term
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : order.status.toLowerCase() === activeFilter.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === '' ||
      order.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const filterTabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'waiting', label: 'Waiting', count: orders.filter(o => o.status === 'Waiting').length },
    { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'Preparing').length },
    { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'Ready').length },
    { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'Completed').length },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === tab.id ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Token Search / Lookup Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Lookup Token (e.g. FF-108)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">Token</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Order Items</th>
              <th className="py-3.5 px-4 text-center">Weight</th>
              <th className="py-3.5 px-4 text-center">Ahead</th>
              <th className="py-3.5 px-4 text-center">Est. Wait</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">No orders found matching filter criteria</p>
                  <p className="text-xs text-slate-400 mt-1">Try switching tabs or clearing your search input.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className={`hover:bg-brand-50/30 transition-colors ${
                    order.status === 'Preparing' ? 'bg-blue-50/20' : ''
                  }`}
                >
                  {/* Token Number */}
                  <td className="py-4 px-4 sm:px-6 font-black text-sm text-brand-600">
                    <span className="bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg">
                      {order.token}
                    </span>
                  </td>

                  {/* Customer Name */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{order.customerName}</div>
                    <div className="text-[10px] text-slate-400">{order.customerPhone || order.id}</div>
                  </td>

                  {/* Order Items & Prep */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-slate-800">
                          <span className="font-bold">{item.fishName}</span>
                          <span className="text-[11px] text-brand-700 font-semibold bg-brand-50 px-1.5 py-0.5 rounded ml-1">
                            {item.preparation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Weight */}
                  <td className="py-4 px-4 text-center font-bold text-slate-900">
                    {order.totalWeightKg} kg
                  </td>

                  {/* Orders Ahead */}
                  <td className="py-4 px-4 text-center font-bold text-slate-600">
                    {order.ordersAhead}
                  </td>

                  {/* Estimated Wait */}
                  <td className="py-4 px-4 text-center font-bold text-slate-800">
                    ~{order.estimatedWaitMinutes} min
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <StatusBadge status={order.status} size="sm" />
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === 'Waiting' && (
                        <button
                          onClick={() => onStatusChange(order.id, 'Preparing')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Prep</span>
                        </button>
                      )}

                      {order.status === 'Preparing' && (
                        <button
                          onClick={() => onStatusChange(order.id, 'Ready')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Ready</span>
                        </button>
                      )}

                      {order.status === 'Ready' && (
                        <button
                          onClick={() => onStatusChange(order.id, 'Completed')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      )}

                      {order.status === 'Completed' && (
                        <span className="text-[11px] text-slate-400 font-medium italic">
                          Done ({order.actualPrepMinutes || 5} min)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
