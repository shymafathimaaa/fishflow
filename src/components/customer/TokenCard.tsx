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
      <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-brand-50/60 via-white to-white space-y-4">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
          FishFlow Token ID
        </span>

        {/* Large Token + Copy Action */}
        <div className="flex items-center justify-center gap-3">
          <div className="text-5xl sm:text-6xl font-black text-brand-600 tracking-tight filter drop-shadow-xs">
            {order.token}
          </div>
          <button
            onClick={handleCopyToken}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-brand-300 text-slate-500 hover:text-brand-600 shadow-2xs transition-all active:scale-95"
            title="Copy Token to clipboard"
            aria-label="Copy Token ID"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {copied && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block animate-fade-in">
            Copied Token to Clipboard!
          </span>
        )}

        <div className="flex justify-center pt-1">
          <StatusBadge status={order.status} size="lg" />
        </div>

        {/* Inline QR Code & Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 max-w-lg mx-auto items-center">
          
          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center">
            {qrSrc ? (
              <img src={qrSrc} alt={`QR Code for ${order.token}`} className="w-24 h-24 rounded-lg" />
            ) : (
              <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <QrCode className="w-8 h-8" />
              </div>
            )}
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Scan at Counter
            </span>
          </div>

          {/* Metric 1: Est Wait */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Estimated Wait</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5">
              ~{order.estimatedWaitMinutes} mins
            </span>
            <span className="text-[10px] text-slate-400">{order.confidenceRange}</span>
          </div>

          {/* Metric 2: Orders Ahead */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-1">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Orders Ahead</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5">
              {order.ordersAhead}
            </span>
            <span className="text-[10px] text-slate-400">in live queue</span>
          </div>
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
