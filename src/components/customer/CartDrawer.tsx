import React, { useState } from 'react';
import { OrderItem } from '../../types';
import { ShoppingBag, X, Trash2, ArrowRight, User, Phone, Clock, Sparkles } from 'lucide-react';
import { calculateOrderPrepTime } from '../../ai/waitTimePrediction';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: Partial<OrderItem>) => void;
  onCheckout: (customerName: string, customerPhone: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateItem,
  onCheckout,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const totalWeight = items.reduce((sum, item) => sum + item.quantityKg, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const estimatedPrepMinutes = Math.max(3, Math.round(calculateOrderPrepTime(items)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Please enter your name to generate your token.');
      return;
    }
    setFormError('');
    onCheckout(customerName.trim(), customerPhone.trim());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-soft-lg flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Your Market Pre-Order</h2>
                <p className="text-xs text-brand-300">
                  {items.length} {items.length === 1 ? 'item' : 'items'} ({totalWeight} kg)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select your fish and preparation preferences from the catalog to build your order.
                </p>
              </div>
            ) : (
              <>
                {/* AI Wait Preview Banner */}
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="p-2 bg-brand-500 text-white rounded-lg shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-900 block">AI Prep Estimate</span>
                    <span className="text-xs text-brand-700">
                      Estimated ~{estimatedPrepMinutes} mins preparation time once at counter.
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{item.fishName}</h4>
                          <span className="text-xs text-brand-600 font-semibold bg-brand-100/80 px-2 py-0.5 rounded mt-1 inline-block">
                            Prep: {item.preparation}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Controls: Quantity Selector */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Quantity:</span>
                          <select
                            value={item.quantityKg}
                            onChange={(e) => {
                              const qty = parseFloat(e.target.value);
                              onUpdateItem(item.id, {
                                quantityKg: qty,
                                subtotal: Math.round(qty * item.pricePerKg),
                              });
                            }}
                            className="bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-800"
                          >
                            <option value={0.5}>0.5 kg</option>
                            <option value={1}>1.0 kg</option>
                            <option value={1.5}>1.5 kg</option>
                            <option value={2}>2.0 kg</option>
                            <option value={2.5}>2.5 kg</option>
                            <option value={3}>3.0 kg</option>
                            <option value={5}>5.0 kg</option>
                          </select>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-slate-900 text-sm">₹{item.subtotal}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Form */}
                <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-200 space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-600" />
                    <span>Customer Information</span>
                  </h3>

                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number <span className="text-slate-400 font-normal">(Optional for SMS alerts)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="e.g. 98765 43210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      />
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Drawer Footer / Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between text-slate-600 text-sm">
                <span>Total Items ({items.length})</span>
                <span className="font-bold text-slate-900">{totalWeight} kg</span>
              </div>
              <div className="flex items-center justify-between text-slate-900 font-extrabold text-lg">
                <span>Estimated Total (Demo)</span>
                <span className="text-brand-600">₹{totalAmount}</span>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-extrabold rounded-xl shadow-soft hover:shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Place Pre-Order & Get Token</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
