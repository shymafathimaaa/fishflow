import React from 'react';
import { Fish, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Fish className="w-5 h-5" />
              </div>
              <span className="text-white font-extrabold text-xl">FishFlow</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              AI-assisted fish market pre-order and smart queue management system designed to eliminate customer waiting times.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Customer Pre-Order</a></li>
              <li><a href="/track/recent" className="hover:text-white transition-colors">Track Active Token</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Market Staff Dashboard</a></li>
              <li><a href="/recent" className="hover:text-white transition-colors">Order History</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FishFlow. Fresh fish. Less waiting.</p>
          <p className="flex items-center gap-1">
            Built with React, Vite & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};
