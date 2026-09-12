import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { INITIAL_FISH_CATALOG } from '../data/seedData';
import { FishItem, OrderItem, PreparationType } from '../types';
import { FishCard } from '../components/customer/FishCard';
import { PrepSelector } from '../components/customer/PrepSelector';
import { CartDrawer } from '../components/customer/CartDrawer';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { getOrders, createOrder, getActiveWorkers, subscribeToStore } from '../services/store';
import { predictWaitTime } from '../ai/waitTimePrediction';
import { Fish, Clock, ShoppingBag, ArrowRight, Sparkles, CheckCircle2, Zap, Filter, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomerHomeProps {
  cartItems: OrderItem[];
  setCartItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  cartItems,
  setCartItems,
  isCartOpen,
  setIsCartOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [selectedFish, setSelectedFish] = useState<FishItem | null>(null);
  const [quantityKg, setQuantityKg] = useState<number>(1.5);
  const [customQtyInput, setCustomQtyInput] = useState<string>('');
  const [isCustomQty, setIsCustomQty] = useState<boolean>(false);
  const [preparation, setPreparation] = useState<PreparationType>('Cut + Cleaned');
  
  // Category Filter & Search State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Queue Live Stats
  const [waitingCount, setWaitingCount] = useState<number>(0);
  const [avgWaitMinutes, setAvgWaitMinutes] = useState<number>(6);

  useEffect(() => {
    // Smooth scroll if URL has #catalog
    if (location.hash === '#catalog') {
      const elem = document.getElementById('catalog');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const updateStats = () => {
      const orders = getOrders();
      const waiting = orders.filter(o => o.status === 'Waiting' || o.status === 'Preparing');
      setWaitingCount(waiting.length);
      const activeWorkers = getActiveWorkers();
      const workload = waiting.reduce((sum, o) => sum + o.totalWeightKg, 0);
      const prediction = predictWaitTime({
        ordersAhead: waiting.length,
        totalWeightKg: 1.5,
        items: [],
        activeWorkers,
        queueSize: waiting.length,
        currentWorkloadKg: workload,
      });
      setAvgWaitMinutes(prediction.estimatedWaitMinutes);
    };

    updateStats();
    return subscribeToStore(updateStats);
  }, []);

  const categories = ['All', 'Popular', 'Mackerel', 'Sardine', 'Tuna', 'Pomfret', 'Kingfish', 'Red Snapper'];

  const filteredCatalog = INITIAL_FISH_CATALOG.filter((fish) => {
    const matchesCategory =
      activeCategory === 'All'
        ? true
        : activeCategory === 'Popular'
        ? fish.badge === 'Popular' || fish.badge === 'Best Seller'
        : fish.category === activeCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      fish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fish.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleOpenFishModal = (fish: FishItem) => {
    setSelectedFish(fish);
    setQuantityKg(1.5);
    setIsCustomQty(false);
    setCustomQtyInput('');
    setPreparation(fish.popularPrep || 'Cut + Cleaned');
  };

  const handleAddToCart = () => {
    if (!selectedFish) return;

    const finalQty = isCustomQty ? parseFloat(customQtyInput) || 1 : quantityKg;
    if (isNaN(finalQty) || finalQty <= 0) {
      showToast('Invalid Quantity', 'Please enter a valid weight in kg.', 'error');
      return;
    }

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fishId: selectedFish.id,
      fishName: selectedFish.name,
      quantityKg: finalQty,
      preparation,
      pricePerKg: selectedFish.pricePerKg,
      subtotal: Math.round(finalQty * selectedFish.pricePerKg),
    };

    setCartItems((prev) => [...prev, newItem]);
    showToast('Added to Pre-Order', `${selectedFish.name} (${finalQty}kg, ${preparation}) added to cart.`, 'success');
    setSelectedFish(null);
    setIsCartOpen(true);
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item Removed', 'Item removed from your cart.', 'info');
  };

  const handleUpdateCartItem = (itemId: string, updates: Partial<OrderItem>) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const handleCheckout = (customerName: string, customerPhone: string) => {
    if (cartItems.length === 0) return;

    const totalWeight = cartItems.reduce((sum, item) => sum + item.quantityKg, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    const newOrder = createOrder({
      customerName,
      customerPhone,
      items: cartItems,
      totalWeightKg: totalWeight,
      totalAmount,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    setCartItems([]);
    setIsCartOpen(false);
    showToast('Order Placed Successfully!', `Your Token is ${newOrder.token}`, 'success');
    navigate(`/confirm/${newOrder.token}`);
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-14 lg:py-20 bg-gradient-to-b from-brand-50/80 via-slate-50 to-slate-50 rounded-3xl border border-slate-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Headline & Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                <span>AI-Assisted Market Pre-Order System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Fresh fish.{' '}
                <span className="bg-gradient-to-r from-brand-600 via-teal-500 to-brand-500 bg-clip-text text-transparent">
                  Less waiting.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Select your fish, quantity, and cutting requirements before reaching the market counter. Receive your digital market token and skip physical queue waiting.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#catalog"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-extrabold text-base rounded-2xl shadow-soft hover:shadow-brand-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  <span>Start an Order</span>
                  <ArrowRight className="w-5 h-5" />
                </a>

                <button
                  onClick={() => navigate('/track/recent')}
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>Track Active Token</span>
                </button>
              </div>

              {/* Feature Chips */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" /> No app download required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" /> Instant PDF token & QR Code
                </span>
              </div>
            </div>

            {/* Right Live Queue Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-lg space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-extrabold text-xs tracking-wider uppercase text-slate-800">
                      LIVE MARKET QUEUE
                    </span>
                  </div>
                  <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full">
                    6 Active Staff Counters
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-400 font-semibold block">Queue Backlog</span>
                    <span className="text-3xl font-black text-slate-900 block mt-1">{waitingCount}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Orders preparing ahead</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-400 font-semibold block">Current Est. Wait</span>
                    <span className="text-3xl font-black text-brand-600 block mt-1">~{avgWaitMinutes} m</span>
                    <span className="text-[10px] text-slate-500 font-medium">Per 1.5 kg purchase</span>
                  </div>
                </div>

                <div className="bg-brand-50/80 p-4 rounded-2xl border border-brand-100 flex items-start gap-3 text-xs text-brand-900">
                  <Zap className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Prototype Observation Note:</strong>
                    Field observation input: ~4–8 min wait per kg. Pre-ordering lets staff cut your fish before you reach the counter!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fish Selection Catalog Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="bg-teal-50 text-teal-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-teal-200 uppercase tracking-wider inline-block">
            Step 1: Choose Your Fish
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Today's Fresh Catch Catalog
          </h2>
          <p className="text-slate-600 text-sm">
            Select any fish item below to configure quantity weight and preparation requirements.
          </p>
        </div>

        {/* Search & Category Filter Header Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search fish species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        {/* Fish Cards Grid */}
        {filteredCatalog.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Fish className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No fish species found</h3>
            <p className="text-xs text-slate-500">Try selecting "All" categories or clearing your search term.</p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-brand-50 text-brand-600 font-bold rounded-xl text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map((fish) => (
              <FishCard
                key={fish.id}
                fish={fish}
                onSelect={handleOpenFishModal}
                isSelected={cartItems.some((item) => item.fishId === fish.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Fish Item Customization Modal */}
      {selectedFish && (
        <Modal
          isOpen={!!selectedFish}
          onClose={() => setSelectedFish(null)}
          title={`Configure Order: ${selectedFish.name}`}
          footer={
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Total Item Subtotal</span>
                <span className="text-xl font-black text-brand-600">
                  ₹{Math.round((isCustomQty ? parseFloat(customQtyInput) || 1 : quantityKg) * selectedFish.pricePerKg)}
                </span>
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-soft flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Pre-Order</span>
              </button>
            </div>
          }
        >
          <div className="space-y-6">
            
            {/* Selected Fish Info Banner */}
            <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <img
                src={selectedFish.image}
                alt={selectedFish.name}
                className="w-16 h-16 rounded-xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e0f2fe"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="30">🐟</text></svg>';
                }}
              />
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedFish.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedFish.description}</p>
                <span className="text-xs font-bold text-brand-600 mt-1 block">
                  ₹{selectedFish.pricePerKg} / kg (Demo Price)
                </span>
              </div>
            </div>

            {/* Step 2: Weight Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Select Quantity (kg)
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[1, 1.5, 2].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setQuantityKg(preset);
                      setIsCustomQty(false);
                    }}
                    className={`py-3 rounded-xl font-extrabold text-sm border transition-all ${
                      !isCustomQty && quantityKg === preset
                        ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    {preset} kg
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsCustomQty(true)}
                  className={`py-3 rounded-xl font-extrabold text-xs sm:text-sm border transition-all ${
                    isCustomQty
                      ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomQty && (
                <div className="pt-2 animate-fade-in">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="10"
                    placeholder="Enter weight in kg (e.g. 3.5)..."
                    value={customQtyInput}
                    onChange={(e) => setCustomQtyInput(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Step 3: Preparation Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Select Preparation Requirement
              </label>
              <PrepSelector selectedPrep={preparation} onChange={setPreparation} />
            </div>
          </div>
        </Modal>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onUpdateItem={handleUpdateCartItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};
