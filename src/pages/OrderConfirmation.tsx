import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderByToken, subscribeToStore } from '../services/store';
import { Order } from '../types';
import { TokenCard } from '../components/customer/TokenCard';
import { CheckCircle2, ArrowLeft, Clock } from 'lucide-react';

export const OrderConfirmation: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | undefined>(() =>
    token ? getOrderByToken(token) : undefined
  );

  useEffect(() => {
    if (!token) return;
    const updateOrder = () => {
      setOrder(getOrderByToken(token));
    };
    updateOrder();
    return subscribeToStore(updateOrder);
  }, [token]);

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-soft space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Token Not Found</h2>
        <p className="text-xs text-slate-500">
          We could not find an order matching token <strong>{token}</strong>. It may have been cleared or created in another session.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-bold rounded-xl text-xs hover:bg-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
          <span>Pre-Order Successfully Registered!</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Your Digital Market Token is Ready
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Save or download your PDF token. Present this token at the FishFlow market counter when your token is called.
        </p>
      </div>

      {/* Main Token Display Component */}
      <TokenCard order={order} />
    </div>
  );
};
