export type ProductCategory = 'tech' | 'gaming' | 'fashion' | 'home' | 'accessories';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  iconName: string;
  baseCost: number;       // Wholesale purchase cost
  sellingPrice: number;   // Configurable by user
  recommendedPrice: number;
  stock: number;
  unlocked: boolean;
  unlockCost: number;
  demandMultiplier: number; // Modulated by trends
  autoRestock: boolean;
  autoRestockThreshold: number;
  autoRestockAmount: number;
  salesCount: number;
  totalRevenue: number;
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  customerAvatar: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  totalPrice: number;
  orderedAtDay: number;
  status: 'pending' | 'packing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  shippingMethod: 'standard' | 'express' | 'drone';
  shippingCost: number;
  timeRemainingSeconds: number; // Deadline before penalty/cancellation
  maxTimeSeconds: number;
  packProgress: number; // 0 to 100 for manual or worker packing
}

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  day: number;
  productName: string;
  orderId: string;
}

export interface StaffMember {
  id: string;
  role: 'packer' | 'support' | 'marketer' | 'manager' | 'loader';
  name: string;
  avatar: string;
  level: number;
  salaryPerDay: number;
  efficiency: number; // multiplier
  hired: boolean;
  costToHire: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: 'social' | 'search' | 'influencer' | 'email' | 'viral';
  description: string;
  dailyCost: number;
  trafficBonus: number;      // extra visitors per second
  conversionBoost: number;   // +% conversion rate
  active: boolean;
  durationDaysRemaining: number;
  totalCostSpent: number;
}

export interface WebstoreUpgrade {
  id: string;
  name: string;
  category: 'server' | 'ux' | 'payment' | 'security';
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  description: string;
  effectLabel: string;
}

export interface WarehouseLocation {
  id: string;
  name: string;
  description: string;
  capacity: number;
  dailyRent: number;
  upgradeCost: number;
  packingStations: number;
  automationLevel: number;
  isUnlocked: boolean;
  iconName: string;
}

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  category: 'trend' | 'crisis' | 'opportunity' | 'black_friday';
  durationDays: number;
  daysLeft: number;
  effect: {
    categoryBoost?: ProductCategory;
    boostMultiplier?: number;
    shippingCostMultiplier?: number;
    trafficMultiplier?: number;
  };
}

export interface DailyFinancialRecord {
  day: number;
  revenue: number;
  cogs: number; // Cost of goods sold
  shippingCost: number;
  marketingCost: number;
  salaries: number;
  rent: number;
  taxes: number;
  loanPayment: number;
  treasuryYield: number;
  netProfit: number;
  ordersFulfilled: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardMoney: number;
  isUnlocked: boolean;
  progress: number;
  target: number;
  unlockedAtDay?: number;
}

// Truck & Fleet Logistics Types
export interface TruckVehicle {
  id: string;
  name: string;
  description: string;
  capacityBoxes: number;
  speedMultiplier: number;
  freightBonusPercent: number;
  cost: number;
  unlocked: boolean;
  icon: string;
}

export interface TruckRoute {
  id: string;
  name: string;
  destination: string;
  durationSeconds: number;
  freightBonusPercent: number;
  minBoxes: number;
  reputationGain: number;
  color: string;
}

export interface ActiveTruckTrip {
  id: string;
  vehicleName: string;
  routeName: string;
  destination: string;
  boxesCount: number;
  totalOrderValue: number;
  freightPayout: number;
  progressPercent: number;
  remainingSeconds: number;
  totalSeconds: number;
}

// Financial Center & Banking Types
export interface BankLoan {
  id: string;
  title: string;
  institution: string;
  principal: number;
  remainingDebt: number;
  dailyPayment: number;
  interestRate: number; // e.g. 5%
  totalDays: number;
  daysPaid: number;
  active: boolean;
}

export interface TreasuryFund {
  investedCash: number;
  dailyInterestRate: number; // e.g. 0.0025 (0.25% ao dia)
  totalYieldEarned: number;
}

export interface GameState {
  companyName: string;
  cash: number;
  reputation: number; // 0 to 100
  currentDay: number;
  dayProgress: number; // 0 to 100 percentage of current day
  gameSpeed: 0 | 1 | 2 | 3; // 0 = paused, 1 = normal, 2 = fast, 3 = hyper
  soundEnabled: boolean;
  
  warehouseTier: number; // Index in warehouse list
  products: Product[];
  orders: CustomerOrder[];
  completedOrdersCount: number;
  reviews: CustomerReview[];
  staff: StaffMember[];
  marketing: MarketingCampaign[];
  webstoreUpgrades: WebstoreUpgrade[];
  warehouses: WarehouseLocation[];
  activeEvents: MarketEvent[];
  financialHistory: DailyFinancialRecord[];
  achievements: Achievement[];
  
  // Real-time metrics
  activeVisitors: number;
  conversionRate: number;
  lifetimeRevenue: number;
  lifetimeProfit: number;
  todayRevenue: number;
  todayCogs: number;
  todayShipping: number;

  // Logistics & Truck Loading Bay State
  stagedBoxes: number; // Boxes packed on the staging pallet ready to load
  truckVehicles: TruckVehicle[];
  currentTruckTier: number;
  loadedTruckBoxes: number; // Boxes currently stacked in truck bed
  activeTruckTrip: ActiveTruckTrip | null;
  totalTrucksDispatched: number;

  // Financial & Banking State
  loans: BankLoan[];
  treasury: TreasuryFund;
  taxRegime: 'mei' | 'simples' | 'lucro_presumido';
  hiredAccountant: boolean;
  todayTaxes: number;
  todayInterestYield: number;
}
