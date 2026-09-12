import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, setActiveWorkers, getMarketMetrics, resetDemoData, subscribeToStore } from '../services/store';
import { Order, OrderStatus, MarketMetrics } from '../types';
import { StatCard } from '../components/dashboard/StatCard';
import { NowServingCard } from '../components/dashboard/NowServingCard';
import { QueueTable } from '../components/dashboard/QueueTable';
import { AiPredictionPanel } from '../components/dashboard/AiPredictionPanel';
import { MarketInsights } from '../components/dashboard/MarketInsights';
import { useToast } from '../components/common/Toast';
import { Clock, RefreshCw, CheckCircle2, CheckCheck, Users, RotateCcw, LayoutDashboard } from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [metrics, setMetrics] = useState<MarketMetrics>(() => getMarketMetrics());

  useEffect(() => {
    const handleStoreChange = () => {
      setOrders(getOrders());
      setMetrics(getMarketMetrics());
    };

    handleStoreChange();
    return subscribeToStore(handleStoreChange);
  }, []);

  // Compute active order for Now Serving banner
  const preparingOrders = orders.filter(o => o.status === 'Preparing');
  const waitingOrders = orders.filter(o => o.status === 'Waiting');
  
  // Current order being prepared or ready
  const currentServingOrder = preparingOrders[0] || orders.filter(o => o.status === 'Ready')[0];
  const nextWaitingOrder = waitingOrders[0];

  const handleCallNextToken = () => {
    if (!nextWaitingOrder) {
      showToast('No Waiting Orders', 'The queue is currently clear!', 'info');
      return;
    }
    const updated = updateOrderStatus(nextWaitingOrder.id, 'Preparing');
    if (updated) {
      showToast('Calling Token', `Now serving token ${updated.token} (${updated.customerName})`, 'success');
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = updateOrderStatus(orderId, newStatus);
    if (updated) {
      showToast('Status Updated', `Token ${updated.token} updated to ${newStatus}`, 'success');
    }
  };

  const handleWorkerCountChange = (count: number) => {
    setActiveWorkers(count);
    showToast('Active Workers Updated', `Set active counter staff to ${count}. Wait times recalculated.`, 'info');
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset queue store back to default demo state?')) {
      resetDemoData();
      showToast('Demo State Reset', 'Queue reset to initial demo orders.', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-900 to-slate-800 text-teal-400 flex items-center justify-center shadow-soft">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">FishFlow Market Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium">Real-time counter queue control & dispatch management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDemo}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
            title="Reset to sample demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Waiting Orders"
          value={metrics.waitingCount}
          subtitle="Pending in queue"
          color="amber"
          icon={<Clock className="w-5 h-5" />}
        />

        <StatCard
          title="Now Preparing"
          value={metrics.preparingCount}
          subtitle="Cutting at counter"
          color="blue"
          icon={<RefreshCw className="w-5 h-5 animate-spin" />}
        />

        <StatCard
          title="Ready for Pickup"
          value={metrics.readyCount}
          subtitle="Waiting for customer"
          color="emerald"
          icon={<CheckCircle2 className="w-5 h-5 animate-bounce" />}
        />

        <StatCard
          title="Completed Today"
          value={metrics.completedCount}
          subtitle="Dispatched orders"
          color="slate"
          icon={<CheckCheck className="w-5 h-5" />}
        />

        <StatCard
          title="Est. Avg Wait"
          value={`~${metrics.averageWaitMinutes}m`}
          subtitle={`With ${metrics.activeWorkers} workers`}
          color="teal"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Now Serving Active Dispatch Hero Card */}
      <NowServingCard
        currentOrder={currentServingOrder}
        nextWaitingOrder={nextWaitingOrder}
        onCallNext={handleCallNextToken}
        onMarkReady={(id) => handleStatusChange(id, 'Ready')}
        onMarkCompleted={(id) => handleStatusChange(id, 'Completed')}
      />

      {/* Live Queue Management Table */}
      <QueueTable
        orders={orders}
        onStatusChange={handleStatusChange}
      />

      {/* AI Queue Prediction Engine Panel */}
      <AiPredictionPanel
        metrics={metrics}
        onWorkerCountChange={handleWorkerCountChange}
      />

      {/* Market Operational Insights & Charts */}
      <MarketInsights metrics={metrics} />
    </div>
  );
};
