export type PreparationType = 'Whole' | 'Cut' | 'Cleaned' | 'Cut + Cleaned';

export type OrderStatus = 'Waiting' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export type FishCategory = 'Mackerel' | 'Sardine' | 'Tuna' | 'Pomfret' | 'Kingfish' | 'Red Snapper' | 'Other';

export interface FishItem {
  id: string;
  name: string;
  category: FishCategory;
  pricePerKg: number;
  available: boolean;
  unit: string;
  image: string;
  description: string;
  badge?: string;
  popularPrep?: PreparationType;
}

export interface OrderItem {
  id: string;
  fishId: string;
  fishName: string;
  quantityKg: number;
  preparation: PreparationType;
  pricePerKg: number;
  subtotal: number;
}

export interface Order {
  id: string;
  token: string; // e.g. "FF-108"
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalWeightKg: number;
  totalAmount: number;
  status: OrderStatus;
  ordersAhead: number;
  estimatedWaitMinutes: number;
  confidenceRange: string; // e.g. "6–8 mins"
  createdAt: string;
  startedPreparingAt?: string;
  readyAt?: string;
  completedAt?: string;
  actualPrepMinutes?: number;
  notes?: string;
}

export interface WaitTimeInput {
  ordersAhead: number;
  totalWeightKg: number;
  items: OrderItem[];
  activeWorkers: number;
  queueSize: number;
  currentWorkloadKg: number;
}

export interface WaitTimePrediction {
  estimatedWaitMinutes: number;
  minWaitMinutes: number;
  maxWaitMinutes: number;
  confidenceRange: string;
  workloadFactor: number;
  prepComplexityFactor: number;
  explanation: string;
}

export interface MarketMetrics {
  waitingCount: number;
  preparingCount: number;
  readyCount: number;
  completedCount: number;
  averageWaitMinutes: number;
  activeWorkers: number;
  totalOrdersToday: number;
  peakQueueSize: number;
  mostPopularPrep: string;
  averagePrepTimeMinutes: number;
  predictionAccuracyPercent: number;
}
