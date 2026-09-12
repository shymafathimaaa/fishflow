import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { Download, Compass, Home, Clock, Layers, Copy, Check, QrCode } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { generateTokenPDF } from '../../utils/pdfGenerator';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';

interface TokenCardProps {
  order: Order;
}

export const TokenCard: React.FC<TokenCardProps> = ({ order }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrSrc, setQrSrc] = useState<string>('');

  useEffect(() => {
    // Generate inline QR Code Data URL for web display
    const generateQr = async () => {
      try {
        const payload = JSON.stringify({
          token: order.token,
          orderId: order.id,
          customer: order.customerName,
          status: order.status,
        });
        const url = await QRCode.toDataURL(payload, { width: 140, margin: 1 });
        setQrSrc(url);
      } catch (e) {
        console.error(e);
      }
    };
    generateQr();
  }, [order]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await generateTokenPDF(order);
    } catch (e) {
      console.error('PDF Generation Error:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(order.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-lg overflow-hidden max-w-xl mx-auto my-4 transition-all">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-6 text-center relative">
        <span className="bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider inline-block mb-2 shadow-2xs">
          Your Market Digital Token
        </span>
        <h2 className="text-sm font-semibold text-slate-300">Order Confirmed for {order.customerName}</h2>
      </div>

      {/* Main Token Display Box */}
      <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-brand-50/60 via-white to-white space-y-8">
        <div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
            FishFlow Token ID
          </span>

          {/* Large Token + Copy Action */}
          <div className="flex items-center justify-center gap-3">
            <div className="text-6xl sm:text-7xl font-black text-brand-600 tracking-tight filter drop-shadow-sm">
              {order.token}
            </div>
            <button
              onClick={handleCopyToken}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-brand-300 text-slate-500 hover:text-brand-600 shadow-sm transition-all active:scale-95"
              title="Copy Token to clipboard"
              aria-label="Copy Token ID"
            >
              {copied ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>

          {copied && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-block animate-fade-in mt-2">
              Copied Token to Clipboard!
            </span>
          )}
        </div>

        {/* Visual Progress Steps Tracker */}
        <div className="py-2 max-w-sm mx-auto">
          <div className="relative">
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 -z-0">
              <div
                className="h-1 bg-gradient-to-r from-brand-600 to-teal-500 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, ['Waiting', 'Preparing', 'Ready', 'Completed'].indexOf(order.status)) / 3) * 100}%`,
                }}
              />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              {['Waiting', 'Preparing', 'Ready', 'Completed'].map((statusLabel, idx) => {
                const currentIndex = ['Waiting', 'Preparing', 'Ready', 'Completed'].indexOf(order.status);
                const isDone = currentIndex >= idx;
                const isCurrent = currentIndex === idx;

                return (
                  <div key={statusLabel} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                        isDone
                          ? 'bg-gradient-to-tr from-brand-600 to-teal-500 text-white shadow-md'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-brand-100 scale-110' : ''}`}
                    >
                      {isDone ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-bold mt-2 absolute -bottom-6 ${
                        isCurrent ? 'text-brand-700' : isDone ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Prominent Live Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-6 max-w-lg mx-auto">
          {/* Metric 1: Orders Ahead */}
          <div className="bg-white p-5 rounded-2xl border-2 border-teal-100 shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm text-slate-500 font-bold uppercase tracking-wide mb-1">Orders Ahead</span>
            <span className="text-4xl font-black text-slate-900 mb-1">
              {order.ordersAhead}
            </span>
            <span className="text-xs text-slate-400 font-medium">in live queue</span>
          </div>

          {/* Metric 2: Est Wait */}
          <div className="bg-white p-5 rounded-2xl border-2 border-brand-100 shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm text-slate-500 font-bold uppercase tracking-wide mb-1">Estimated Wait</span>
            <span className="text-4xl font-black text-slate-900 mb-1">
              {order.estimatedWaitMinutes} <span className="text-2xl font-bold text-slate-600">min</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">{order.confidenceRange}</span>
          </div>
        </div>
      </div>

      {/* QR Code Section (Moved above Items) */}
      <div className="p-6 border-t border-slate-100 bg-white flex flex-col items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Present QR Code at Counter
        </span>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          {qrSrc ? (
            <img src={qrSrc} alt={`QR Code for ${order.token}`} className="w-32 h-32 rounded-lg" />
          ) : (
            <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
              <QrCode className="w-10 h-10" />
            </div>
          )}
        </div>
      </div>

      {/* Items Summary List */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Order Items ({order.items.length})
        </h4>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm bg-white p-3 rounded-xl border border-slate-200/60">
              <div>
                <span className="font-bold text-slate-800">{item.fishName}</span>
                <span className="text-[11px] text-brand-700 font-semibold bg-brand-50 px-1.5 py-0.5 rounded ml-2">
                  Prep: {item.preparation}
                </span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-900">{item.quantityKg} kg</span>
                <span className="text-[11px] text-slate-400 block">₹{item.subtotal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-white border-t border-slate-100 space-y-3">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-extrabold rounded-xl shadow-soft flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>{downloading ? 'Generating PDF Token...' : 'Download Printable Token PDF'}</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/track/${order.token}`}
            className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm text-center flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95"
          >
            <Compass className="w-4 h-4 text-teal-400" />
            <span>Track Order</span>
          </Link>

          <Link
            to="/"
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm text-center flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Back to Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
