import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  CustomerOrder,
  CustomerReview,
  DailyFinancialRecord,
  TruckRoute,
  ActiveTruckTrip
} from './types/game';
import { INITIAL_STATE } from './data/initialState';
import { sound } from './utils/audio';
import { generateRandomOrder, generateCustomerReview, getRandomEvent } from './utils/gameLogic';
import confetti from 'canvas-confetti';

import { Header } from './components/Header';
import { EventBanner } from './components/EventBanner';
import { Navigation, TabType } from './components/Navigation';
import { OrderPackingBench } from './components/OrderPackingBench';
import { TruckLoadingBay } from './components/TruckLoadingBay';
import { InventoryManager } from './components/InventoryManager';
import { WebstoreUpgrades } from './components/WebstoreUpgrades';
import { MarketingHub } from './components/MarketingHub';
import { StaffManagement } from './components/StaffManagement';
import { WarehouseExpansion } from './components/WarehouseExpansion';
import { FinancialDashboard } from './components/FinancialDashboard';
import { AchievementsModal } from './components/AchievementsModal';

const SAVE_STORAGE_KEY = 'eshop_tycoon_save_v2';

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATE,
          ...parsed,
          gameSpeed: 1, // Start active
        };
      }
    } catch {
      // Ignore parse errors and use initial
    }
    return INITIAL_STATE;
  });

  const [currentTab, setCurrentTab] = useState<TabType>('workbench');
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // Sync sound engine enabled state
  useEffect(() => {
    sound.enabled = state.soundEnabled;
  }, [state.soundEnabled]);

  // Periodic LocalStorage Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to autosave game:', err);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [state]);

  // Main Simulation Loop
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (state.gameSpeed === 0) return;

    // Simulation tick every 350ms (adjusted by gameSpeed)
    const tickIntervalMs = 350 / state.gameSpeed;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.gameSpeed === 0) return prev;

        let newCash = prev.cash;
        let newDay = prev.currentDay;
        let newDayProgress = prev.dayProgress + 1.2; // ~28 seconds per day at 1x
        let newActiveEvents = [...prev.activeEvents];
        let newFinancialHistory = [...prev.financialHistory];
        let newTodayRevenue = prev.todayRevenue;
        let newTodayCogs = prev.todayCogs;
        let newTodayShipping = prev.todayShipping;
        let newProducts = [...prev.products];
        let newReviews = [...prev.reviews];
        let newReputation = prev.reputation;
        let newCompletedCount = prev.completedOrdersCount;

        // Truck & Logistics state
        let newActiveTruckTrip = prev.activeTruckTrip ? { ...prev.activeTruckTrip } : null;
        let newLoadedTruckBoxes = prev.loadedTruckBoxes;
        let newStagedBoxes = prev.stagedBoxes;
        let newTotalTrucksDispatched = prev.totalTrucksDispatched;

        // Banking & Treasury state
        let newLoans = [...prev.loans];
        let newTreasury = { ...prev.treasury };
        let todayLoansPaid = 0;
        let todayTreasuryEarned = 0;

        // Day End Reconciliation when dayProgress >= 100%
        if (newDayProgress >= 100) {
          newDayProgress = 0;
          newDay += 1;

          // Deduct staff salaries
          const totalSalaries = prev.staff
            .filter((s) => s.hired)
            .reduce((acc, s) => acc + s.salaryPerDay, 0);

          // Deduct active marketing
          const totalMarketing = prev.marketing
            .filter((m) => m.active)
            .reduce((acc, m) => acc + m.dailyCost, 0);

          // Deduct warehouse rent
          const currentRent = prev.warehouses[prev.warehouseTier].dailyRent;

          // Deduct active bank loans amortization
          newLoans = newLoans.map((loan) => {
            if (loan.active && loan.remainingDebt > 0) {
              const payment = Math.min(loan.remainingDebt, loan.dailyPayment);
              todayLoansPaid += payment;
              const newDebt = Math.max(0, loan.remainingDebt - payment);
              return {
                ...loan,
                remainingDebt: newDebt,
                daysPaid: loan.daysPaid + 1,
                active: newDebt > 0,
              };
            }
            return loan;
          });

          // Daily Treasury yield from CDI (0.3% ao dia)
          todayTreasuryEarned = Math.round(newTreasury.investedCash * newTreasury.dailyInterestRate * 100) / 100;
          newTreasury.investedCash += todayTreasuryEarned;
          newTreasury.totalYieldEarned += todayTreasuryEarned;

          // Tax calculation (Simples Nacional: 7% or 4% with accountant)
          const taxRate = prev.hiredAccountant ? 0.04 : 0.07;
          const dayTaxes = Math.round(newTodayRevenue * taxRate * 100) / 100;

          const dayExpenses = totalSalaries + totalMarketing + currentRent + todayLoansPaid + dayTaxes;
          newCash -= dayExpenses;

          const netDayProfit =
            newTodayRevenue - (newTodayCogs + newTodayShipping + dayExpenses) + todayTreasuryEarned;

          const record: DailyFinancialRecord = {
            day: prev.currentDay,
            revenue: newTodayRevenue,
            cogs: newTodayCogs,
            shippingCost: newTodayShipping,
            marketingCost: totalMarketing,
            salaries: totalSalaries,
            rent: currentRent,
            taxes: dayTaxes,
            loanPayment: todayLoansPaid,
            treasuryYield: todayTreasuryEarned,
            netProfit: netDayProfit,
            ordersFulfilled: prev.orders.filter((o) => o.status === 'delivered').length,
          };

          newFinancialHistory = [record, ...newFinancialHistory.slice(0, 20)];

          // Auto-restock products
          const currentTotalStock = newProducts.reduce((acc, p) => acc + p.stock, 0);
          let remainingWhCapacity = Math.max(0, prev.warehouses[prev.warehouseTier].capacity - currentTotalStock);

          newProducts = newProducts.map((p) => {
            if (p.unlocked && p.autoRestock && p.stock <= p.autoRestockThreshold && remainingWhCapacity > 0) {
              const qtyToBuy = Math.min(p.autoRestockAmount, remainingWhCapacity);
              const cost = qtyToBuy * p.baseCost;
              if (newCash >= cost && qtyToBuy > 0) {
                newCash -= cost;
                remainingWhCapacity -= qtyToBuy;
                return { ...p, stock: p.stock + qtyToBuy };
              }
            }
            return p;
          });

          // Decrement and roll events
          newActiveEvents = newActiveEvents
            .map((e) => ({ ...e, daysLeft: e.daysLeft - 1 }))
            .filter((e) => e.daysLeft > 0);

          // Chance to trigger new event
          if (newActiveEvents.length === 0 && Math.random() > 0.4) {
            newActiveEvents.push(getRandomEvent());
          }

          // Reset daily counters
          newTodayRevenue = 0;
          newTodayCogs = 0;
          newTodayShipping = 0;
        }

        // --- TRUCK TRIP SIMULATION TICK ---
        if (newActiveTruckTrip) {
          const currentVeh = prev.truckVehicles[prev.currentTruckTier];
          const stepSeconds = 0.35 * (currentVeh.speedMultiplier || 1.0);
          const remaining = Math.max(0, newActiveTruckTrip.remainingSeconds - stepSeconds);
          const progress = Math.min(
            100,
            ((newActiveTruckTrip.totalSeconds - remaining) / newActiveTruckTrip.totalSeconds) * 100
          );

          if (remaining <= 0) {
            // Truck delivered freight!
            const tripPayout = newActiveTruckTrip.totalOrderValue + newActiveTruckTrip.freightPayout;
            newCash += tripPayout;
            newTodayRevenue += tripPayout;
            newReputation = Math.min(100, newReputation + 2.0);
            newTotalTrucksDispatched += 1;
            newActiveTruckTrip = null;

            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.6 },
            });
            sound.playSuccess();
            sound.playCash();
          } else {
            newActiveTruckTrip.remainingSeconds = remaining;
            newActiveTruckTrip.progressPercent = progress;
          }
        }

        // --- AUTOMATED LOADERS WORKING AT DOCK ---
        const hiredLoaders = prev.staff.filter((s) => s.hired && s.role === 'loader');
        if (hiredLoaders.length > 0 && !newActiveTruckTrip && newStagedBoxes > 0) {
          const currentVeh = prev.truckVehicles[prev.currentTruckTier];
          if (newLoadedTruckBoxes < currentVeh.capacityBoxes) {
            const loaderPower = hiredLoaders.reduce((acc, l) => acc + l.efficiency, 0);
            if (Math.random() < 0.4 * loaderPower) {
              newStagedBoxes -= 1;
              newLoadedTruckBoxes += 1;
            }
          }
        }

        // --- AUTOMATED PACKERS WORKING AT BENCH ---
        const hiredPackers = prev.staff.filter((s) => s.hired && s.role === 'packer');
        const packingPowerPerTick = hiredPackers.reduce((acc, p) => acc + p.efficiency * 5, 0);

        let updatedOrders = [...prev.orders];

        if (packingPowerPerTick > 0) {
          let powerRemaining = packingPowerPerTick;
          updatedOrders = updatedOrders.map((ord) => {
            if ((ord.status === 'pending' || ord.status === 'packing') && powerRemaining > 0) {
              const needed = 100 - ord.packProgress;
              const applied = Math.min(needed, powerRemaining);
              powerRemaining -= applied;
              const newProgress = ord.packProgress + applied;
              return {
                ...ord,
                packProgress: newProgress,
                status: newProgress >= 100 ? 'packed' : 'packing',
              };
            }
            return ord;
          });
        }

        // Countdown deadline for unfulfilled orders
        let hasOrderCancelled = false;
        const remainingOrders: CustomerOrder[] = [];

        for (const order of updatedOrders) {
          if (order.status === 'delivered') continue;

          const updatedTime = order.timeRemainingSeconds - 0.35;

          if (updatedTime <= 0 && order.status !== 'packed') {
            // Cancelled order!
            hasOrderCancelled = true;
            newReputation = Math.max(10, newReputation - 4);
            const review = generateCustomerReview(order, false, prev.products, prev.currentDay);
            newReviews = [review, ...newReviews.slice(0, 40)];
          } else {
            remainingOrders.push({
              ...order,
              timeRemainingSeconds: Math.max(0, updatedTime),
            });
          }
        }

        if (hasOrderCancelled) {
          sound.playWarning();
        }

        // Spawning new orders
        const maxOrdersCapacity = [4, 8, 14, 20][prev.warehouseTier] || 4;

        const activeMktTraffic = prev.marketing
          .filter((m) => m.active)
          .reduce((acc, m) => acc + m.trafficBonus, 0);

        const eventTrafficMult = newActiveEvents.reduce(
          (acc, evt) => acc * (evt.effect.trafficMultiplier || 1.0),
          1.0
        );

        const baseVisitors = 5 + prev.webstoreUpgrades[0].level * 10;
        const currentVisitors = Math.round((baseVisitors + activeMktTraffic * 12) * eventTrafficMult);

        const unlockedWithStock = newProducts.filter((p) => p.unlocked && p.stock > 0);
        const orderSpawnRoll = Math.random();
        const baseSpawnThreshold = 0.65 - prev.webstoreUpgrades[1].level * 0.05;

        if (
          remainingOrders.length < maxOrdersCapacity &&
          unlockedWithStock.length > 0 &&
          orderSpawnRoll > baseSpawnThreshold
        ) {
          const newOrder = generateRandomOrder({
            ...prev,
            products: newProducts,
            activeEvents: newActiveEvents,
          });

          if (newOrder) {
            remainingOrders.push(newOrder);
            sound.playOrderBell();
          }
        }

        // Live Achievements Tracker
        const updatedAchievements = prev.achievements.map((ach) => {
          let currentVal = ach.progress;
          if (ach.id === 'ach-first-sale' || ach.id === 'ach-10-orders' || ach.id === 'ach-100-orders') {
            currentVal = newCompletedCount;
          } else if (ach.id === 'ach-reputation-90') {
            currentVal = Math.round(newReputation);
          } else if (ach.id === 'ach-revenue-10k' || ach.id === 'ach-revenue-100k') {
            currentVal = Math.round(prev.lifetimeRevenue);
          } else if (ach.id === 'ach-first-hire') {
            currentVal = prev.staff.filter((s) => s.hired).length;
          } else if (ach.id === 'ach-garage-unlocked') {
            currentVal = prev.warehouseTier >= 1 ? 1 : 0;
          }
          return {
            ...ach,
            progress: Math.max(ach.progress, currentVal),
          };
        });

        return {
          ...prev,
          cash: newCash,
          currentDay: newDay,
          dayProgress: newDayProgress,
          orders: remainingOrders,
          products: newProducts,
          reviews: newReviews,
          reputation: newReputation,
          activeEvents: newActiveEvents,
          financialHistory: newFinancialHistory,
          activeVisitors: currentVisitors,
          achievements: updatedAchievements,
          stagedBoxes: newStagedBoxes,
          loadedTruckBoxes: newLoadedTruckBoxes,
          activeTruckTrip: newActiveTruckTrip,
          totalTrucksDispatched: newTotalTrucksDispatched,
          loans: newLoans,
          treasury: newTreasury,
        };
      });
    }, tickIntervalMs);

    return () => clearInterval(interval);
  }, [state.gameSpeed]);

  // --- ORDER ACTIONS ---
  const handlePackOrder = useCallback((orderId: string, amount: number) => {
    setState((prev) => {
      const updated = prev.orders.map((ord) => {
        if (ord.id === orderId) {
          const newProgress = Math.min(100, ord.packProgress + amount);
          return {
            ...ord,
            packProgress: newProgress,
            status: newProgress >= 100 ? ('packed' as const) : ('packing' as const),
          };
        }
        return ord;
      });
      return { ...prev, orders: updated };
    });
  }, []);

  const handleShipOrder = useCallback((orderId: string) => {
    setState((prev) => {
      const targetOrder = prev.orders.find((o) => o.id === orderId);
      if (!targetOrder) return prev;

      // Deduct items from stock
      const updatedProducts = prev.products.map((p) => {
        const item = targetOrder.items.find((it) => it.productId === p.id);
        if (item) {
          return {
            ...p,
            stock: Math.max(0, p.stock - item.quantity),
            salesCount: p.salesCount + item.quantity,
            totalRevenue: p.totalRevenue + item.unitPrice * item.quantity,
          };
        }
        return p;
      });

      const totalEarnings = targetOrder.totalPrice + targetOrder.shippingCost;
      const cogs = targetOrder.items.reduce((acc, it) => {
        const prod = prev.products.find((p) => p.id === it.productId);
        return acc + (prod ? prod.baseCost * it.quantity : 0);
      }, 0);

      const review = generateCustomerReview(targetOrder, true, prev.products, prev.currentDay);
      const newReviews = [review, ...prev.reviews.slice(0, 40)];
      const newReputation = Math.min(100, prev.reputation + 0.6);

      sound.playCash();

      return {
        ...prev,
        cash: prev.cash + totalEarnings,
        lifetimeRevenue: prev.lifetimeRevenue + totalEarnings,
        todayRevenue: prev.todayRevenue + totalEarnings,
        todayCogs: prev.todayCogs + cogs,
        todayShipping: prev.todayShipping + targetOrder.shippingCost,
        completedOrdersCount: prev.completedOrdersCount + 1,
        reputation: newReputation,
        products: updatedProducts,
        reviews: newReviews,
        orders: prev.orders.filter((o) => o.id !== orderId),
        stagedBoxes: prev.stagedBoxes + 1, // Ready in dock pallet!
      };
    });
  }, []);

  const handlePackAllReady = useCallback(() => {
    setState((prev) => {
      const packedOrders = prev.orders.filter((o) => o.status === 'packed');
      if (packedOrders.length === 0) return prev;

      let extraCash = 0;
      let extraCogs = 0;
      let extraShipping = 0;
      const updatedProducts = [...prev.products];
      const newReviews = [...prev.reviews];

      for (const order of packedOrders) {
        extraCash += order.totalPrice + order.shippingCost;
        extraShipping += order.shippingCost;

        for (const item of order.items) {
          const prodIdx = updatedProducts.findIndex((p) => p.id === item.productId);
          if (prodIdx >= 0) {
            extraCogs += updatedProducts[prodIdx].baseCost * item.quantity;
            updatedProducts[prodIdx] = {
              ...updatedProducts[prodIdx],
              stock: Math.max(0, updatedProducts[prodIdx].stock - item.quantity),
              salesCount: updatedProducts[prodIdx].salesCount + item.quantity,
              totalRevenue: updatedProducts[prodIdx].totalRevenue + item.unitPrice * item.quantity,
            };
          }
        }

        const review = generateCustomerReview(order, true, prev.products, prev.currentDay);
        newReviews.unshift(review);
      }

      sound.playCash();

      return {
        ...prev,
        cash: prev.cash + extraCash,
        lifetimeRevenue: prev.lifetimeRevenue + extraCash,
        todayRevenue: prev.todayRevenue + extraCash,
        todayCogs: prev.todayCogs + extraCogs,
        todayShipping: prev.todayShipping + extraShipping,
        completedOrdersCount: prev.completedOrdersCount + packedOrders.length,
        reputation: Math.min(100, prev.reputation + packedOrders.length * 0.5),
        products: updatedProducts,
        reviews: newReviews.slice(0, 50),
        orders: prev.orders.filter((o) => o.status !== 'packed'),
        stagedBoxes: prev.stagedBoxes + packedOrders.length,
      };
    });
  }, []);

  // --- TRUCK & FLEET DISPATCH ACTIONS ---
  const handleLoadBoxToTruck = useCallback((count: number) => {
    setState((prev) => {
      const toMove = Math.min(count, prev.stagedBoxes);
      if (toMove <= 0) return prev;
      return {
        ...prev,
        stagedBoxes: prev.stagedBoxes - toMove,
        loadedTruckBoxes: prev.loadedTruckBoxes + toMove,
      };
    });
  }, []);

  const handleUnloadBoxFromTruck = useCallback(() => {
    setState((prev) => ({
      ...prev,
      stagedBoxes: prev.stagedBoxes + prev.loadedTruckBoxes,
      loadedTruckBoxes: 0,
    }));
  }, []);

  const handleDispatchTruck = useCallback((route: TruckRoute) => {
    setState((prev) => {
      if (prev.activeTruckTrip || prev.loadedTruckBoxes <= 0) return prev;

      const currentVeh = prev.truckVehicles[prev.currentTruckTier];
      const baseBoxValue = 110.0;
      const totalCargoValue = prev.loadedTruckBoxes * baseBoxValue;
      const freightBonus =
        totalCargoValue * ((route.freightBonusPercent + currentVeh.freightBonusPercent) / 100);

      const trip: ActiveTruckTrip = {
        id: `trip-${Date.now()}`,
        vehicleName: currentVeh.name,
        routeName: route.name,
        destination: route.destination,
        boxesCount: prev.loadedTruckBoxes,
        totalOrderValue: Math.round(totalCargoValue),
        freightPayout: Math.round(freightBonus),
        progressPercent: 0,
        remainingSeconds: route.durationSeconds,
        totalSeconds: route.durationSeconds,
      };

      return {
        ...prev,
        activeTruckTrip: trip,
        loadedTruckBoxes: 0,
      };
    });
  }, []);

  const handleUpgradeTruckVehicle = useCallback((vehIndex: number) => {
    setState((prev) => {
      const veh = prev.truckVehicles[vehIndex];
      if (!veh) return prev;

      // Already unlocked: just switch
      if (veh.unlocked) {
        return { ...prev, currentTruckTier: vehIndex };
      }

      // Buy new vehicle
      if (prev.cash < veh.cost) return prev;

      const updatedVehicles = prev.truckVehicles.map((v, i) =>
        i === vehIndex ? { ...v, unlocked: true } : v
      );

      return {
        ...prev,
        cash: prev.cash - veh.cost,
        truckVehicles: updatedVehicles,
        currentTruckTier: vehIndex,
      };
    });
  }, []);

  // --- FINANCIAL CENTER & BANKING ACTIONS ---
  const handleTakeLoan = useCallback((loanId: string) => {
    setState((prev) => {
      const loan = prev.loans.find((l) => l.id === loanId);
      if (!loan || loan.active) return prev;

      const updatedLoans = prev.loans.map((l) =>
        l.id === loanId ? { ...l, active: true, daysPaid: 0, remainingDebt: l.principal * (1 + l.interestRate / 100) } : l
      );

      return {
        ...prev,
        cash: prev.cash + loan.principal,
        loans: updatedLoans,
      };
    });
  }, []);

  const handlePayoffLoan = useCallback((loanId: string) => {
    setState((prev) => {
      const loan = prev.loans.find((l) => l.id === loanId);
      if (!loan || !loan.active || prev.cash < loan.remainingDebt) return prev;

      const updatedLoans = prev.loans.map((l) =>
        l.id === loanId ? { ...l, active: false, remainingDebt: 0 } : l
      );

      return {
        ...prev,
        cash: prev.cash - loan.remainingDebt,
        loans: updatedLoans,
      };
    });
  }, []);

  const handleDepositTreasury = useCallback((amount: number) => {
    setState((prev) => {
      if (prev.cash < amount) return prev;
      return {
        ...prev,
        cash: prev.cash - amount,
        treasury: {
          ...prev.treasury,
          investedCash: prev.treasury.investedCash + amount,
        },
      };
    });
  }, []);

  const handleWithdrawTreasury = useCallback((amount: number) => {
    setState((prev) => {
      const toWithdraw = Math.min(amount, prev.treasury.investedCash);
      return {
        ...prev,
        cash: prev.cash + toWithdraw,
        treasury: {
          ...prev.treasury,
          investedCash: prev.treasury.investedCash - toWithdraw,
        },
      };
    });
  }, []);

  const handleHireAccountant = useCallback(() => {
    setState((prev) => {
      if (prev.cash < 1800 || prev.hiredAccountant) return prev;
      return {
        ...prev,
        cash: prev.cash - 1800,
        hiredAccountant: true,
      };
    });
  }, []);

  // --- CATALOG & SOURCING ACTIONS ---
  const handleBuyStock = useCallback((productId: string, quantity: number) => {
    setState((prev) => {
      const prod = prev.products.find((p) => p.id === productId);
      if (!prod) return prev;

      const totalCost = prod.baseCost * quantity;
      if (prev.cash < totalCost) return prev;

      const updated = prev.products.map((p) => {
        if (p.id === productId) {
          return { ...p, stock: p.stock + quantity };
        }
        return p;
      });

      return {
        ...prev,
        cash: prev.cash - totalCost,
        products: updated,
      };
    });
  }, []);

  const handleUnlockProduct = useCallback((productId: string) => {
    setState((prev) => {
      const prod = prev.products.find((p) => p.id === productId);
      if (!prod || prev.cash < prod.unlockCost) return prev;

      const updated = prev.products.map((p) => {
        if (p.id === productId) {
          return { ...p, unlocked: true, stock: 5 };
        }
        return p;
      });

      return {
        ...prev,
        cash: prev.cash - prod.unlockCost,
        products: updated,
      };
    });
  }, []);

  const handleUpdateSellingPrice = useCallback((productId: string, newPrice: number) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, sellingPrice: Math.max(1, newPrice) } : p
      ),
    }));
  }, []);

  const handleToggleAutoRestock = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, autoRestock: !p.autoRestock } : p
      ),
    }));
  }, []);

  const handleUpdateAutoRestockSettings = useCallback(
    (productId: string, threshold: number, amount: number) => {
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId
            ? { ...p, autoRestockThreshold: threshold, autoRestockAmount: amount }
            : p
        ),
      }));
    },
    []
  );

  // --- WEBSTORE UPGRADES ---
  const handleWebstoreUpgrade = useCallback((upgradeId: string) => {
    setState((prev) => {
      const upg = prev.webstoreUpgrades.find((u) => u.id === upgradeId);
      if (!upg || upg.level >= upg.maxLevel) return prev;

      const cost = Math.round(upg.baseCost * Math.pow(upg.costMultiplier, upg.level - 1));
      if (prev.cash < cost) return prev;

      const updatedUpgrades = prev.webstoreUpgrades.map((u) => {
        if (u.id === upgradeId) {
          return { ...u, level: u.level + 1 };
        }
        return u;
      });

      let extraConversion = 0;
      if (upg.category === 'ux') {
        extraConversion = 1.2;
      }

      return {
        ...prev,
        cash: prev.cash - cost,
        conversionRate: prev.conversionRate + extraConversion,
        webstoreUpgrades: updatedUpgrades,
      };
    });
  }, []);

  // --- MARKETING CAMPAIGNS ---
  const handleToggleCampaign = useCallback((campaignId: string) => {
    setState((prev) => {
      const updatedMarketing = prev.marketing.map((m) =>
        m.id === campaignId ? { ...m, active: !m.active } : m
      );
      return { ...prev, marketing: updatedMarketing };
    });
  }, []);

  // --- STAFF & HR ---
  const handleHireStaff = useCallback((staffId: string) => {
    setState((prev) => {
      const member = prev.staff.find((s) => s.id === staffId);
      if (!member || prev.cash < member.costToHire) return prev;

      const updatedStaff = prev.staff.map((s) =>
        s.id === staffId ? { ...s, hired: true } : s
      );

      return {
        ...prev,
        cash: prev.cash - member.costToHire,
        staff: updatedStaff,
      };
    });
  }, []);

  const handleFireStaff = useCallback((staffId: string) => {
    setState((prev) => ({
      ...prev,
      staff: prev.staff.map((s) => (s.id === staffId ? { ...s, hired: false } : s)),
    }));
  }, []);

  const handleTrainStaff = useCallback((staffId: string) => {
    setState((prev) => {
      const member = prev.staff.find((s) => s.id === staffId);
      if (!member) return prev;

      const trainCost = Math.round(member.costToHire * 1.5 * member.level);
      if (prev.cash < trainCost) return prev;

      const updatedStaff = prev.staff.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            level: s.level + 1,
            efficiency: s.efficiency + 0.35,
            salaryPerDay: Math.round(s.salaryPerDay * 1.25),
          };
        }
        return s;
      });

      return {
        ...prev,
        cash: prev.cash - trainCost,
        staff: updatedStaff,
      };
    });
  }, []);

  // --- WAREHOUSE EXPANSION ---
  const handleUpgradeWarehouse = useCallback((tierIndex: number) => {
    setState((prev) => {
      const wh = prev.warehouses[tierIndex];
      if (!wh || prev.cash < wh.upgradeCost) return prev;

      return {
        ...prev,
        cash: prev.cash - wh.upgradeCost,
        warehouseTier: tierIndex,
      };
    });
  }, []);

  // --- ACHIEVEMENTS ---
  const handleClaimAchievement = useCallback((achievementId: string) => {
    setState((prev) => {
      const ach = prev.achievements.find((a) => a.id === achievementId);
      if (!ach || ach.isUnlocked) return prev;

      const updatedAchievements = prev.achievements.map((a) =>
        a.id === achievementId ? { ...a, isUnlocked: true } : a
      );

      return {
        ...prev,
        cash: prev.cash + ach.rewardMoney,
        achievements: updatedAchievements,
      };
    });
  }, []);

  const handleResetGame = useCallback(() => {
    localStorage.removeItem(SAVE_STORAGE_KEY);
    setState({ ...INITIAL_STATE });
    setCurrentTab('workbench');
  }, []);

  const unclaimedAchievementsCount = state.achievements.filter(
    (a) => !a.isUnlocked && a.progress >= a.target
  ).length;

  const lowStockCount = state.products.filter((p) => p.unlocked && p.stock <= 3).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        state={state}
        onUpdateCompanyName={(name) => setState((p) => ({ ...p, companyName: name }))}
        onSetGameSpeed={(speed) => setState((p) => ({ ...p, gameSpeed: speed }))}
        onToggleSound={() => setState((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
        onResetGame={handleResetGame}
        onOpenAchievements={() => setShowAchievementsModal(true)}
        unclaimedAchievementsCount={unclaimedAchievementsCount}
      />

      {/* Market Events / Trends Banner */}
      <EventBanner events={state.activeEvents} />

      {/* Main Tab Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingOrdersCount={state.orders.filter((o) => o.status !== 'delivered').length}
        stagedBoxesCount={state.stagedBoxes}
        lowStockCount={lowStockCount}
        hasActiveTrip={!!state.activeTruckTrip}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {currentTab === 'workbench' && (
          <OrderPackingBench
            state={state}
            onPackOrder={handlePackOrder}
            onShipOrder={handleShipOrder}
            onPackAllReady={handlePackAllReady}
            onGoToInventory={() => setCurrentTab('inventory')}
            onGoToMarketing={() => setCurrentTab('marketing')}
            onGoToTruck={() => setCurrentTab('truck')}
          />
        )}

        {currentTab === 'truck' && (
          <TruckLoadingBay
            state={state}
            onLoadBoxToTruck={handleLoadBoxToTruck}
            onUnloadBoxFromTruck={handleUnloadBoxFromTruck}
            onDispatchTruck={handleDispatchTruck}
            onUpgradeTruckVehicle={handleUpgradeTruckVehicle}
            onGoToWorkbench={() => setCurrentTab('workbench')}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryManager
            state={state}
            onBuyStock={handleBuyStock}
            onUnlockProduct={handleUnlockProduct}
            onUpdateSellingPrice={handleUpdateSellingPrice}
            onToggleAutoRestock={handleToggleAutoRestock}
            onUpdateAutoRestockSettings={handleUpdateAutoRestockSettings}
          />
        )}

        {currentTab === 'webstore' && (
          <WebstoreUpgrades state={state} onUpgrade={handleWebstoreUpgrade} />
        )}

        {currentTab === 'marketing' && (
          <MarketingHub state={state} onToggleCampaign={handleToggleCampaign} />
        )}

        {currentTab === 'staff' && (
          <StaffManagement
            state={state}
            onHireStaff={handleHireStaff}
            onFireStaff={handleFireStaff}
            onTrainStaff={handleTrainStaff}
          />
        )}

        {currentTab === 'warehouse' && (
          <WarehouseExpansion state={state} onUpgradeWarehouse={handleUpgradeWarehouse} />
        )}

        {currentTab === 'finances' && (
          <FinancialDashboard
            state={state}
            onTakeLoan={handleTakeLoan}
            onPayoffLoan={handlePayoffLoan}
            onDepositTreasury={handleDepositTreasury}
            onWithdrawTreasury={handleWithdrawTreasury}
            onHireAccountant={handleHireAccountant}
          />
        )}
      </main>

      {/* Achievements Modal */}
      {showAchievementsModal && (
        <AchievementsModal
          state={state}
          onClose={() => setShowAchievementsModal(false)}
          onClaimAchievement={handleClaimAchievement}
        />
      )}
    </div>
  );
}
