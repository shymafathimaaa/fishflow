import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Fish, Clock, ShoppingBag, LayoutDashboard, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartItemCount = 0, onOpenCart }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDashboard = location.pathname.startsWith('/dashboard');

  const customerLinks = [
    { name: 'Home', path: '/' },
    { name: 'Order Fish', path: '/#catalog' },
    { name: 'Track Order', path: '/track/recent' },
    { name: 'Recent Order', path: '/recent' },
  ];

  const dashboardLinks = [
    { name: 'Live Queue', path: '/dashboard' },
    { name: 'AI Prediction', path: '/dashboard#ai-panel' },
    { name: 'Market Insights', path: '/dashboard#insights' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
              <Fish className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  FishFlow
                </span>
                {isDashboard && (
                  <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-brand-200">
                    Market Staff
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-xs font-medium text-slate-500">
                Fresh fish. Less waiting.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!isDashboard ? (
              customerLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })
            ) : (
              dashboardLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
                >
                  {link.name}
                </a>
              ))
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {!isDashboard ? (
              <>
                {/* Cart Button */}
                {onOpenCart && (
                  <button
                    onClick={onOpenCart}
                    className="relative flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-sm font-semibold border border-slate-200 shadow-xs hover:border-slate-300 transition-all active:scale-95"
                    aria-label="Open Cart"
                  >
                    <ShoppingBag className="w-4 h-4 text-brand-600" />
                    <span className="hidden sm:inline">Cart</span>
                    {cartItemCount > 0 && (
                      <span className="bg-teal-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Dashboard Link Switcher */}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-soft hover:shadow-brand-500/20 active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-400" />
                  <span className="hidden sm:inline">Staff Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                </Link>
              </>
            ) : (
              <Link
                to="/"
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 shadow-xs transition-all"
              >
                <Fish className="w-4 h-4 text-brand-600" />
                <span>Customer View</span>
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-4 space-y-2">
          {!isDashboard ? (
            customerLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.name}
              </Link>
            ))
          ) : (
            dashboardLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.name}
              </a>
            ))
          )}
        </div>
      )}
    </header>
  );
};
