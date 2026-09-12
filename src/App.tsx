import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { OrderItem } from './types';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastProvider } from './components/common/Toast';
import { CustomerHome } from './pages/CustomerHome';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { OrderTracker } from './pages/OrderTracker';
import { RecentOrders } from './pages/RecentOrders';
import { StaffDashboard } from './pages/StaffDashboard';

export const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const cartCount = cartItems.length;

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
        
        {/* Unified Top Navigation */}
        <Navbar
          cartItemCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Application Page Body */}
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <CustomerHome
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  isCartOpen={isCartOpen}
                  setIsCartOpen={setIsCartOpen}
                />
              }
            />
            <Route path="/confirm/:token" element={<OrderConfirmation />} />
            <Route path="/track/:token" element={<OrderTracker />} />
            <Route path="/recent" element={<RecentOrders />} />
            <Route path="/dashboard" element={<StaffDashboard />} />
            <Route
              path="*"
              element={
                <CustomerHome
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  isCartOpen={isCartOpen}
                  setIsCartOpen={setIsCartOpen}
                />
              }
            />
          </Routes>
        </main>

        {/* Unified Footer */}
        <Footer />
      </div>
    </ToastProvider>
  );
};

export default App;
