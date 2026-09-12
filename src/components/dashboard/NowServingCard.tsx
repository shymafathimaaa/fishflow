import React from 'react';
import { Order } from '../../types';
import { Megaphone, ArrowRight, CheckCircle2, User, Clock, Volume2 } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface NowServingCardProps {
  currentOrder?: Order;
  nextWaitingOrder?: Order;
  onCallNext: () => void;
  onMarkReady: (orderId: string) => void;
  onMarkCompleted: (orderId: string) => void;
}

export const NowServingCard: React.FC<NowServingCardProps> = ({
  currentOrder,
  nextWaitingOrder,
  onCallNext,
  onMarkReady,
  onMarkCompleted,
}) => {
  // Play subtle web audio chime when calling token
  const playChimeSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const handleCallNextWithSound = () => {
    playChimeSound();
    onCallNext();
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg border border-slate-800 relative overflow-hidden">
      
      {/* Subtle Background Accent Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* Left Column: Now Serving Counter */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                ACTIVE DISPATCH COUNTER
              </span>
            </div>
            
            <button
              onClick={playChimeSound}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
              title="Test audio chime"
            >
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Chime</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <span>NOW SERVING</span>
            {currentOrder && <StatusBadge status={currentOrder.status} size="sm" />}
          </h2>

          {currentOrder ? (
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Token Number</span>
                  <div className="text-4xl sm:text-5xl font-black text-teal-400 tracking-tight">
                    {currentOrder.token}
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs text-slate-400 block font-medium">Customer</span>
                  <span className="font-bold text-white text-base flex items-center gap-1.5 sm:justify-end">
                    <User className="w-4 h-4 text-brand-400" />
                    {currentOrder.customerName}
                  </span>
                  {currentOrder.customerPhone && (
                    <span className="text-xs text-slate-400 block">{currentOrder.customerPhone}</span>
                  )}
                </div>
              </div>

              {/* Items Summary */}
              <div className="pt-1">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Items for Counter Prep:</span>
                <div className="flex flex-wrap gap-2">
                  {currentOrder.items.map((item) => (
                    <span
                      key={item.id}
                      className="bg-slate-900/90 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700"
                    >
                      {item.fishName} · <strong className="text-brand-300">{item.quantityKg} kg</strong> ({item.preparation})
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                {currentOrder.status === 'Preparing' && (
                  <button
                    onClick={() => onMarkReady(currentOrder.id)}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-soft flex items-center gap-2 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Ready for Pickup</span>
                  </button>
                )}

                {currentOrder.status === 'Ready' && (
                  <button
                    onClick={() => onMarkCompleted(currentOrder.id)}
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-soft flex items-center gap-2 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Order Completed</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-800 text-slate-400 text-center">
              <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-300">No active token currently at counter</p>
              <p className="text-xs text-slate-500 mt-1">Click "Call Next Token" below to dispatch the next waiting customer.</p>
            </div>
          )}
        </div>

        {/* Right Column: Call Next CTA & Queue Queue Preview */}
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between h-full space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Up Next in Queue
            </span>
            {nextWaitingOrder ? (
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-brand-300">{nextWaitingOrder.token}</span>
                  <span className="text-xs text-slate-400">{nextWaitingOrder.totalWeightKg} kg</span>
                </div>
                <p className="text-xs font-bold text-slate-200 mt-1">{nextWaitingOrder.customerName}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {nextWaitingOrder.items.map(i => `${i.fishName} (${i.preparation})`).join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">No upcoming waiting orders in queue</p>
            )}
          </div>

          <button
            onClick={handleCallNextWithSound}
            disabled={!nextWaitingOrder}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-brand-500 hover:from-teal-400 hover:to-brand-400 text-white font-black rounded-xl text-sm sm:text-base shadow-soft flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Megaphone className="w-5 h-5 animate-bounce" />
            <span>Call Next Token</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
