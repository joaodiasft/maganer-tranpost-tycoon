import React from 'react';
import {
  Package,
  Boxes,
  Store,
  Megaphone,
  Users,
  Warehouse,
  BarChart3,
  Truck
} from 'lucide-react';
import { sound } from '../utils/audio';

export type TabType =
  | 'workbench'
  | 'truck'
  | 'inventory'
  | 'webstore'
  | 'marketing'
  | 'staff'
  | 'warehouse'
  | 'finances';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingOrdersCount: number;
  stagedBoxesCount: number;
  lowStockCount: number;
  hasActiveTrip: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  pendingOrdersCount,
  stagedBoxesCount,
  lowStockCount,
  hasActiveTrip,
}) => {
  const tabs = [
    {
      id: 'workbench' as TabType,
      label: 'Mesa de Pedidos',
      sublabel: 'Empacotar & Selar',
      icon: Package,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: 'bg-emerald-500 text-slate-950',
    },
    {
      id: 'truck' as TabType,
      label: 'Doca & Caminhões',
      sublabel: 'Carregar & Despachar',
      icon: Truck,
      badge: hasActiveTrip ? 'EM ROTA' : stagedBoxesCount > 0 ? `${stagedBoxesCount} cx` : null,
      badgeColor: hasActiveTrip ? 'bg-indigo-500 text-white' : 'bg-amber-400 text-slate-950',
    },
    {
      id: 'inventory' as TabType,
      label: 'Catálogo & Estoque',
      sublabel: 'Fornecedores & Margem',
      icon: Boxes,
      badge: lowStockCount > 0 ? `! ${lowStockCount}` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'webstore' as TabType,
      label: 'Loja Virtual',
      sublabel: 'Servidores & UX',
      icon: Store,
    },
    {
      id: 'marketing' as TabType,
      label: 'Marketing & Anúncios',
      sublabel: 'Tráfego & Vendas',
      icon: Megaphone,
    },
    {
      id: 'staff' as TabType,
      label: 'Equipe & RH',
      sublabel: 'Chapas & Embaladores',
      icon: Users,
    },
    {
      id: 'warehouse' as TabType,
      label: 'Armazém',
      sublabel: 'Espaço & Expansão',
      icon: Warehouse,
    },
    {
      id: 'finances' as TabType,
      label: 'Centro Financeiro',
      sublabel: 'DRE, Crédito & CDI',
      icon: BarChart3,
    },
  ];

  return (
    <nav className="max-w-7xl w-full mx-auto px-4 mt-3">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(tab.id);
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left whitespace-nowrap transition-all duration-150 relative ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/80 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${tab.badgeColor} animate-pulse`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">{tab.sublabel}</div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
