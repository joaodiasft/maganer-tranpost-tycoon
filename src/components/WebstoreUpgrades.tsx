import React, { useState } from 'react';
import { GameState, WebstoreUpgrade, Product } from '../types/game';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';
import {
  Server,
  Palette,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  CheckCircle,
  Eye,
  ShoppingBag,
  Zap,
  Globe,
  Tag
} from 'lucide-react';

interface WebstoreUpgradesProps {
  state: GameState;
  onUpgrade: (upgradeId: string) => void;
}

export const WebstoreUpgrades: React.FC<WebstoreUpgradesProps> = ({
  state,
  onUpgrade,
}) => {
  const [featuredProductId, setFeaturedProductId] = useState<string>(
    state.products.find((p) => p.unlocked)?.id || ''
  );

  const getUpgradeCost = (upg: WebstoreUpgrade) => {
    return Math.round(upg.baseCost * Math.pow(upg.costMultiplier, upg.level - 1));
  };

  const getUpgradeIcon = (category: string) => {
    switch (category) {
      case 'server':
        return Server;
      case 'ux':
        return Palette;
      case 'payment':
        return CreditCard;
      case 'security':
        return ShieldCheck;
      default:
        return Sparkles;
    }
  };

  const unlockedProducts = state.products.filter((p) => p.unlocked);
  const featuredProduct = state.products.find((p) => p.id === featuredProductId) || unlockedProducts[0];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Plataforma Web & Tecnologia
              </span>
              <span className="text-xs text-slate-400">Conversão Atual: {state.conversionRate.toFixed(1)}%</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Infraestrutura da Loja & Experiência de Compra
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Melhore a estabilidade dos servidores, acelere o carregamento das páginas e ofereça métodos modernos de checkout.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <Globe className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Tráfego em Tempo Real</div>
              <div className="text-sm font-black text-white">
                <span className="text-emerald-400 font-mono">{state.activeVisitors}</span> visitantes online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Storefront Preview + Tech Upgrades */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Storefront Simulation Mock (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">
                  https://www.{state.companyName.toLowerCase().replace(/\s+/g, '')}.com.br
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                AO VIVO
              </span>
            </div>

            {/* Mock Store Header */}
            <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="text-sm font-black text-white tracking-tight">{state.companyName}</div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">⚡ Frete Rápido</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">★ {(state.reputation / 20).toFixed(1)}</span>
              </div>
            </div>

            {/* Hero Deal Banner */}
            <div className="mt-3 bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border border-emerald-500/30 rounded-xl p-3.5 text-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Tag className="w-3.5 h-3.5" />
                <span>DESTAQUE DA SEMANA</span>
              </div>
              <div className="text-sm font-black mt-1">
                {featuredProduct ? featuredProduct.name : 'Selecione um Produto'}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Por apenas{' '}
                <strong className="text-emerald-300 font-mono text-sm">
                  {featuredProduct ? formatCurrency(featuredProduct.sellingPrice) : 'R$ 0,00'}
                </strong>{' '}
                no PIX com 5% OFF!
              </div>
            </div>

            {/* Featured Product Selector */}
            <div className="mt-3">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Escolher Produto em Destaque na Vitrine:
              </label>
              <select
                value={featuredProductId}
                onChange={(e) => setFeaturedProductId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                {unlockedProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(p.sellingPrice)}) - Estoque: {p.stock} un.
                  </option>
                ))}
              </select>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Até 12x s/ Juros e PIX</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Compra 100% Blindada</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
            <span>Servidor: Ativo (99.98% uptime)</span>
            <span>Segurança: Nível {state.webstoreUpgrades.find((u) => u.category === 'security')?.level || 1}</span>
          </div>
        </div>

        {/* Right Side: Tech Upgrades Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.webstoreUpgrades.map((upgrade) => {
            const Icon = getUpgradeIcon(upgrade.category);
            const isMaxLevel = upgrade.level >= upgrade.maxLevel;
            const cost = getUpgradeCost(upgrade);
            const canAfford = state.cash >= cost;

            return (
              <div
                key={upgrade.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Nível {upgrade.level} / {upgrade.maxLevel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3">{upgrade.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{upgrade.description}</p>

                  <div className="mt-3.5 bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 text-xs">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Benefício Atual:</div>
                    <div className="text-emerald-400 font-semibold mt-0.5">{upgrade.effectLabel}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  {isMaxLevel ? (
                    <div className="w-full py-2 bg-slate-800/50 text-emerald-400 font-bold text-xs rounded-xl text-center border border-emerald-500/20 flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Nível Máximo Atingido
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          sound.playSuccess();
                          onUpgrade(upgrade.id);
                        } else {
                          sound.playWarning();
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Evoluir ({formatCurrency(cost)})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
