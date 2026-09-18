import React from 'react';
import { GameState, WarehouseLocation } from '../types/game';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Warehouse,
  Home,
  Building2,
  Boxes,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Package,
  Layers,
  DollarSign
} from 'lucide-react';

interface WarehouseExpansionProps {
  state: GameState;
  onUpgradeWarehouse: (tierIndex: number) => void;
}

export const WarehouseExpansion: React.FC<WarehouseExpansionProps> = ({
  state,
  onUpgradeWarehouse,
}) => {
  const getWarehouseIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return Home;
      case 'Warehouse':
        return Warehouse;
      case 'Building2':
        return Building2;
      case 'Boxes':
        return Boxes;
      default:
        return Warehouse;
    }
  };

  const handleUpgrade = (tierIdx: number) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    sound.playSuccess();
    onUpgradeWarehouse(tierIdx);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Instalações & Logística
              </span>
              <span className="text-xs text-slate-400">Nível {state.warehouseTier + 1} de 4</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Expansão de Armazém & Centros de Distribuição
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mude de endereço para aumentar dramaticamente sua capacidade de estoque e estações simultâneas de empacotamento.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Armazém Atual</div>
            <div className="text-sm font-black text-emerald-400">
              {state.warehouses[state.warehouseTier].name}
            </div>
          </div>
        </div>
      </div>

      {/* Warehouses Timeline / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {state.warehouses.map((wh, idx) => {
          const Icon = getWarehouseIcon(wh.iconName);
          const isCurrent = state.warehouseTier === idx;
          const isPast = state.warehouseTier > idx;
          const isNext = state.warehouseTier + 1 === idx;
          const canAfford = state.cash >= wh.upgradeCost;

          return (
            <div
              key={wh.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative ${
                isCurrent
                  ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/5 bg-slate-900/95 ring-1 ring-emerald-500/30'
                  : isPast
                  ? 'border-slate-800 opacity-60'
                  : isNext
                  ? 'border-indigo-500/40'
                  : 'border-slate-800/80 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isNext
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                      Sede Atual
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      Concluído
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-white mt-4">{wh.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{wh.description}</p>

                {/* Specs Box */}
                <div className="mt-4 bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                      Capacidade de Estoque:
                    </span>
                    <strong className="text-white font-mono">{wh.capacity.toLocaleString('pt-BR')} un.</strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-teal-400" />
                      Bancadas de Envio:
                    </span>
                    <strong className="text-teal-300 font-mono">{wh.packingStations} mesa(s)</strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 pt-1.5 border-t border-slate-800/80">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                      Aluguel Operacional:
                    </span>
                    <strong className="text-slate-300 font-mono">
                      {wh.dailyRent === 0 ? 'Grátis' : `${formatCurrency(wh.dailyRent)}/dia`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                {isCurrent ? (
                  <div className="w-full py-2 bg-emerald-500/10 text-emerald-400 font-black text-xs rounded-xl text-center border border-emerald-500/20 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Operação Ativa Aqui
                  </div>
                ) : isPast ? (
                  <div className="w-full py-2 bg-slate-800/40 text-slate-500 text-xs rounded-xl text-center font-medium">
                    Instalação Anterior
                  </div>
                ) : isNext ? (
                  <button
                    onClick={() => {
                      if (canAfford) {
                        handleUpgrade(idx);
                      } else {
                        sound.playWarning();
                      }
                    }}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Mudar de Galpão ({formatCurrency(wh.upgradeCost)})
                  </button>
                ) : (
                  <div className="w-full py-2 bg-slate-950 text-slate-600 text-xs rounded-xl text-center font-medium border border-slate-900">
                    Requer Galpão Anterior
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
