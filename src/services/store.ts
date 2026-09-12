import { MarketMetrics, Order, OrderStatus } from '../types';
import { INITIAL_DEMO_ORDERS } from '../data/seedData';
import { calculateAccuracyFromHistory, predictWaitTime } from '../ai/waitTimePrediction';

const STORAGE_KEY_ORDERS = 'fishflow_orders_v1';
const STORAGE_KEY_WORKERS = 'fishflow_workers_v1';
const BROADCAST_CHANNEL_NAME = 'fishflow_channel_v1';

// Internal memory fallback & broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not available:', e);
  }
}

// Event Emitter for same-tab reactive UI
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach(fn => fn());
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'STORE_UPDATED', timestamp: Date.now() });
    } catch (e) {
      // ignore channel post error
    }
  }
}

// Setup storage and broadcast listeners
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_ORDERS || e.key === STORAGE_KEY_WORKERS) {
      listeners.forEach(fn => fn());
    }
  });

  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'STORE_UPDATED') {
        listeners.forEach(fn => fn());
      }
    };
  }
}

/**
 * Initialize storage with demo seed data if clean
 */
export function initializeStore(): Order[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_ORDERS;

  const existing = localStorage.getItem(STORAGE_KEY_ORDERS);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
    localStorage.setItem(STORAGE_KEY_WORKERS, '6');
    return INITIAL_DEMO_ORDERS;
  }
  try {
    return JSON.parse(existing) as Order[];
  } catch (e) {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
    return INITIAL_DEMO_ORDERS;
  }
}

/**
 * Retrieve all orders from store
 */
export function getOrders(): Order[] {
  return initializeStore();
}

/**
 * Get single order by ID or Token
 */
export function getOrderByToken(tokenOrId: string): Order | undefined {
  const orders = getOrders();
  const normalized = tokenOrId.trim().toUpperCase();
  return orders.find(o => o.token.toUpperCase() === normalized || o.id === tokenOrId);
}

/**
 * Get active worker count
 */
export function getActiveWorkers(): number {
  if (typeof window === 'undefined') return 6;
  const count = localStorage.getItem(STORAGE_KEY_WORKERS);
  return count ? parseInt(count, 10) : 6;
}

/**
 * Set active worker count and recalculate wait times for waiting orders
 */
export function setActiveWorkers(count: number): void {
  const safeCount = Math.max(1, Math.min(12, count));
  localStorage.setItem(STORAGE_KEY_WORKERS, safeCount.toString());
  recalculateQueueWaitTimes();
  notifyListeners();
}

/**
 * Create a new customer order
 */
export function createOrder(orderData: Omit<Order, 'id' | 'token' | 'createdAt' | 'status' | 'ordersAhead' | 'estimatedWaitMinutes' | 'confidenceRange'>): Order {
  const orders = getOrders();

  // Find next token number (FF-105, FF-106, etc.)
  let maxNum = 104;
  orders.forEach(o => {
    const num = parseInt(o.token.replace('FF-', ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  });

  const nextTokenNum = maxNum + 1;
  const token = `FF-${nextTokenNum}`;
  const id = `ord-${nextTokenNum}`;

  // Calculate current waiting orders ahead
  const waitingOrders = orders.filter(o => o.status === 'Waiting' || o.status === 'Preparing');
  const ordersAhead = waitingOrders.length;
  const activeWorkers = getActiveWorkers();

  // Calculate AI prediction
  const currentWorkloadKg = waitingOrders.reduce((sum, o) => sum + o.totalWeightKg, 0);
  const prediction = predictWaitTime({
    ordersAhead,
    totalWeightKg: orderData.totalWeightKg,
    items: orderData.items,
    activeWorkers,
    queueSize: waitingOrders.length,
    currentWorkloadKg,
  });

  const newOrder: Order = {
    ...orderData,
    id,
    token,
    status: 'Waiting',
    ordersAhead,
    estimatedWaitMinutes: prediction.estimatedWaitMinutes,
    confidenceRange: prediction.confidenceRange,
    createdAt: new Date().toISOString(),
  };

  const updatedOrders = [newOrder, ...orders];
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updatedOrders));
  
  // Store customer's last placed token for quick "Recent Order" retrieval
  if (typeof window !== 'undefined') {
    localStorage.setItem('fishflow_latest_token', token);
  }

  notifyListeners();
  return newOrder;
}

/**
 * Update order status (Waiting -> Preparing -> Ready -> Completed / Cancelled)
 */
export function updateOrderStatus(orderId: string, newStatus: OrderStatus): Order | undefined {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId || o.token === orderId);
  if (index === -1) return undefined;

  const targetOrder = { ...orders[index] };
  const previousStatus = targetOrder.status;
  targetOrder.status = newStatus;

  const now = new Date().toISOString();
  if (newStatus === 'Preparing' && previousStatus === 'Waiting') {
    targetOrder.startedPreparingAt = now;
  } else if (newStatus === 'Ready') {
    if (!targetOrder.startedPreparingAt) targetOrder.startedPreparingAt = now;
    targetOrder.readyAt = now;
  } else if (newStatus === 'Completed') {
    targetOrder.completedAt = now;
    if (targetOrder.startedPreparingAt) {
      const start = new Date(targetOrder.startedPreparingAt).getTime();
      const end = new Date(now).getTime();
      targetOrder.actualPrepMinutes = Math.max(1, Math.round((end - start) / 60000));
    } else {
      targetOrder.actualPrepMinutes = targetOrder.estimatedWaitMinutes;
    }
  }

  orders[index] = targetOrder;
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));

  // Recalculate queue numbers for remaining waiting orders
  recalculateQueueWaitTimes(orders);
  notifyListeners();
  return targetOrder;
}

/**
 * Recalculate queue position and estimated wait time for all waiting orders
 */
export function recalculateQueueWaitTimes(existingOrders?: Order[]): void {
  const orders = existingOrders || getOrders();
  const activeWorkers = getActiveWorkers();

  let waitingCountAhead = 0;
  let accumulatedWorkloadKg = 0;

  // Process in chronological order (oldest first)
  const sorted = [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  sorted.forEach(order => {
    if (order.status === 'Preparing') {
      accumulatedWorkloadKg += order.totalWeightKg * 0.5;
    } else if (order.status === 'Waiting') {
      order.ordersAhead = waitingCountAhead;
      const prediction = predictWaitTime({
        ordersAhead: waitingCountAhead,
        totalWeightKg: order.totalWeightKg,
        items: order.items,
        activeWorkers,
        queueSize: waitingCountAhead + 1,
        currentWorkloadKg: accumulatedWorkloadKg,
      });
      order.estimatedWaitMinutes = prediction.estimatedWaitMinutes;
      order.confidenceRange = prediction.confidenceRange;

      waitingCountAhead += 1;
      accumulatedWorkloadKg += order.totalWeightKg;
    }
  });

  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
}

/**
 * Reset prototype store to fresh demo state
 */
export function resetDemoData(): void {
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
  localStorage.setItem(STORAGE_KEY_WORKERS, '6');
  notifyListeners();
}

/**
 * Retrieve summary analytics and operational metrics for dashboard
 */
export function getMarketMetrics(): MarketMetrics {
  const orders = getOrders();
  const activeWorkers = getActiveWorkers();

  const waitingOrders = orders.filter(o => o.status === 'Waiting');
  const preparingOrders = orders.filter(o => o.status === 'Preparing');
  const readyOrders = orders.filter(o => o.status === 'Ready');
  const completedOrders = orders.filter(o => o.status === 'Completed');

  const totalActive = waitingOrders.length + preparingOrders.length;
  const totalWaitSum = waitingOrders.reduce((sum, o) => sum + o.estimatedWaitMinutes, 0);
  const avgWait = waitingOrders.length > 0 ? Math.round(totalWaitSum / waitingOrders.length) : 4;

  // Prep frequency tally
  const prepCounts: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      prepCounts[item.preparation] = (prepCounts[item.preparation] || 0) + 1;
    });
  });
  const mostPopularPrep = Object.entries(prepCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Cut + Cleaned';

  // Accuracy calculation
  const accuracy = calculateAccuracyFromHistory(completedOrders);

  return {
    waitingCount: waitingOrders.length,
    preparingCount: preparingOrders.length,
    readyCount: readyOrders.length,
    completedCount: completedOrders.length,
    averageWaitMinutes: avgWait,
    activeWorkers,
    totalOrdersToday: orders.length,
    peakQueueSize: Math.max(7, totalActive + 3),
    mostPopularPrep,
    averagePrepTimeMinutes: 5.5,
    predictionAccuracyPercent: accuracy,
  };
}

/**
 * Subscribe to store changes (same-tab and multi-tab)
 */
export function subscribeToStore(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
