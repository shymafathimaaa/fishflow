import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderByToken, updateOrderStatus, subscribeToStore } from '../services/store';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useToast } from '../components/common/Toast';
import { Clock, CheckCircle2, RefreshCw, XCircle, Search, ArrowLeft, Download, ShieldAlert, Radio, Sparkles, Layers } from 'lucide-react';
import { generateTokenPDF } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';

export const OrderTracker: React.FC = () => {
  const { token: paramToken } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [inputToken, setInputToken] = useState<string>('');
  
  // Resolve token ID (or latest placed token)
  const resolvedToken = paramToken === 'recent' 
    ? (typeof window !== 'undefined' ? localStorage.getItem('fishflow_latest_token') || 'FF-101' : 'FF-101')
    : paramToken || 'FF-101';

  const [order, setOrder] = useState<Order | undefined>(() => getOrderByToken(resolvedToken));
  const previousStatusRef = useRef<OrderStatus | undefined>(order?.status);

  useEffect(() => {
    const updateOrderState = () => {
      const current = getOrderByToken(resolvedToken);
      if (current) {
        // Trigger status transition toasts
        if (previousStatusRef.current && previousStatusRef.current !== current.status) {
          if (current.status === 'Preparing') {
            showToast('Order Status Update', `Your order ${current.token} is now being prepared!`, 'info');
          } else if (current.status === 'Ready') {
            showToast('Ready for Pickup!', `Order ${current.token} is ready at the counter!`, 'success');
            try {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
            } catch (e) {}
          } else if (current.status === 'Completed') {
            showToast('Order Completed', `Thank you! Order ${current.token} has been collected.`, 'success');
          }
        }
        previousStatusRef.current = current.status;
        setOrder(current);
      }
    };

    updateOrderState();
    return subscribeToStore(updateOrderState);
  }, [resolvedToken, showToast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    navigate(`/track/${inputToken.trim().toUpperCase()}`);
  };

  const handleCancelOrder = () => {
    if (!order || order.status !== 'Waiting') return;
    if (window.confirm(`Are you sure you want to cancel token ${order.token}?`)) {
      updateOrderStatus(order.id, 'Cancelled');
      showToast('Order Cancelled', `Token ${order.token} has been cancelled.`, 'error');
    }
  };

  const steps: { status: OrderStatus; title: string; desc: string }[] = [
    { status: 'Waiting', title: 'Order Placed', desc: 'Registered in queue' },
    { status: 'Preparing', title: 'Preparing', desc: 'Fish cutting at counter' },
    { status: 'Ready', title: 'Ready for Pickup', desc: 'Collect at market counter' },
    { status: 'Completed', title: 'Completed', desc: 'Order delivered' },
  ];

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Waiting': return 0;
      case 'Preparing': return 1;
      case 'Ready': return 2;
      case 'Completed': return 3;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Lookup Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="text-xs font-bold text-slate-600 hover:text-brand-600 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Enter Token ID (e.g. FF-108)..."
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95"
          >
            Track
          </button>
        </form>
      </div>

      {!order ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-soft space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Token Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active order found for token <strong>{resolvedToken}</strong>. Please verify your token ID or place a new pre-order.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-lg overflow-hidden space-y-8 p-6 sm:p-8">
          
          {/* Live Auto-Sync Reassurance Banner */}
          <div className="bg-gradient-to-r from-brand-900 to-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-200">
                Live Auto-Sync Active: Screen updates automatically when counter staff advance your token.
              </span>
            </div>
            <button
              onClick={() => setOrder(getOrderByToken(resolvedToken))}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Token Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                LIVE MARKET TRACKER
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-4xl font-black text-brand-600 tracking-tight">
                  {order.token}
                </h1>
                <StatusBadge status={order.status} size="lg" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customer: <strong className="text-slate-800">{order.customerName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => generateTokenPDF(order)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-brand-600" />
                <span>PDF Token</span>
              </button>

              {order.status === 'Waiting' && (
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>

          {/* Visual Progress Steps Tracker */}
          {order.status !== 'Cancelled' ? (
            <div className="py-2">
              
              {/* Desktop Steps */}
              <div className="hidden sm:block relative">
                <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0">
                  <div
                    className="h-1 bg-gradient-to-r from-brand-600 to-teal-500 transition-all duration-500"
                    style={{
                      width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  {steps.map((step, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;

                    return (
                      <div key={step.status} className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                            isDone
                              ? 'bg-gradient-to-tr from-brand-600 to-teal-500 text-white shadow-soft scale-110'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>

                        <span
                          className={`text-xs font-bold mt-2 ${
                            isCurrent ? 'text-brand-700 font-extrabold' : isDone ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{step.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Steps Stack */}
              <div className="sm:hidden space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {steps.map((step, idx) => {
                  const isDone = currentStep >= idx;
                  const isCurrent = currentStep === idx;
                  return (
                    <div key={step.status} className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isDone
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isCurrent ? 'text-brand-700' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>This order has been cancelled.</span>
            </div>
          )}

          {/* Live Queue Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Wait</span>
                <Clock className="w-4 h-4 text-brand-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                ~{order.estimatedWaitMinutes} mins
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Confidence range: {order.confidenceRange}
              </span>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders Ahead in Queue</span>
                <Layers className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {order.ordersAhead}
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                {order.ordersAhead === 0 ? 'You are next in line at counter!' : `${order.ordersAhead} customer orders preparing before you`}
              </span>
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="font-bold text-slate-900 text-sm mb-3">Order Items Breakdown</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{item.fishName}</span>
                    <span className="text-brand-700 font-semibold bg-brand-100/80 px-2 py-0.5 rounded ml-2">
                      {item.preparation}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900">{item.quantityKg} kg</span>
                    <span className="text-slate-400 block font-medium">₹{item.subtotal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
