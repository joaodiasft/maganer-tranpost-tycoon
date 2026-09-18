import React from 'react';
import { GameState, CustomerOrder } from '../types/game';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';
import {
  Package,
  PackageCheck,
  Truck,
  Send,
  Clock,
  Sparkles,
  AlertCircle,
  Zap,
  Users,
  Box,
  CheckCircle2,
  Navigation as NavIcon
} from 'lucide-react';

interface OrderPackingBenchProps {
  state: GameState;
  onPackOrder: (orderId: string, amount: number) => void;
  onShipOrder: (orderId: string) => void;
  onPackAllReady: () => void;
  onGoToInventory: () => void;
  onGoToMarketing: () => void;
  onGoToTruck?: () => void;
}

export const OrderPackingBench: React.FC<OrderPackingBenchProps> = ({
  state,
  onPackOrder,
  onShipOrder,
  onPackAllReady,
  onGoToInventory,
  onGoToMarketing,
  onGoToTruck,
}) => {
  const currentWarehouse = state.warehouses[state.warehouseTier];
  const pendingOrders = state.orders.filter(
    (o) => o.status === 'pending' || o.status === 'packing' || o.status === 'packed'
  );

  const readyToShipCount = pendingOrders.filter((o) => o.status === 'packed').length;

  const hiredPackers = state.staff.filter((s) => s.hired && s.role === 'packer');
  const totalPackerSpeed = hiredPackers.reduce((acc, p) => acc + p.efficiency * 12, 0);

  const getProductName = (id: string) => {
    return state.products.find((p) => p.id === id)?.name || 'Item Desconhecido';
  };

  return (
    <div className="space-y-6">
      {/* Workbench Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Linha de Expedição
              </span>
              <span className="text-xs text-slate-400">
                {currentWarehouse?.packingStations} Bancada(s) de Embalagem Ativa(s)
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Bancada de Empacotamento & Despacho
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empacote os produtos encomendados pelos clientes, sele com fita adesiva e cole a etiqueta de envio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Automation status */}
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Equipe de Embaladores</div>
                <div className="text-xs font-bold text-white">
                  {hiredPackers.length > 0 ? (
                    <span className="text-emerald-400">
                      {hiredPackers.length} ativo(s) (+{totalPackerSpeed.toFixed(0)}%/s)
                    </span>
                  ) : (
                    <span className="text-slate-400">Nenhum contratado (Manual)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Dispatch All Packed Button */}
            {readyToShipCount > 0 && (
              <button
                onClick={() => {
                  sound.playTruck();
                  onPackAllReady();
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 animate-bounce"
              >
                <Truck className="w-4 h-4" />
                Despachar Todos Prontos ({readyToShipCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notice / Quick Link to Truck Loading Bay */}
      {state.stagedBoxes > 0 && onGoToTruck && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {state.stagedBoxes} caixa(s) empacotada(s) prontas no Palete da Doca!
              </div>
              <div className="text-[10px] text-slate-400">
                Carregue no caminhão para despachar em rotas interestaduais com bônus de frete acelerado.
              </div>
            </div>
          </div>
          <button
            onClick={onGoToTruck}
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            Carregar Caminhão ➔
          </button>
        </div>
      )}

      {/* Orders Queue Grid */}
      {pendingOrders.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Nenhum Pedido na Fila no Momento</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
            Seus clientes estão navegando na loja! Certifique-se de que seus produtos têm estoque e que você tem campanhas de marketing ativas para gerar mais vendas.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={onGoToInventory}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Box className="w-4 h-4 text-emerald-400" />
              Repor Estoque
            </button>
            <button
              onClick={onGoToMarketing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Impulsionar Anúncios
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingOrders.map((order) => {
            const timePercentage = Math.max(0, Math.min(100, (order.timeRemainingSeconds / order.maxTimeSeconds) * 100));
            const isUrgent = timePercentage < 30;
            const isReady = order.status === 'packed' || order.packProgress >= 100;

            return (
              <div
                key={order.id}
                className={`bg-slate-900 border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  isReady
                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5 bg-slate-900/95'
                    : isUrgent
                    ? 'border-rose-500/50 shadow-lg shadow-rose-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header of Order Card */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                        {order.customerAvatar}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white leading-tight">
                          {order.customerName}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>Pedido #{order.id.slice(-5)}</span>
                          <span>•</span>
                          <span className="uppercase font-semibold text-emerald-400">
                            {order.shippingMethod}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-emerald-400">
                        {formatCurrency(order.totalPrice)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        +{formatCurrency(order.shippingCost)} frete
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="mt-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate max-w-[180px]">
                          {item.quantity}x {getProductName(item.productId)}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Deadline bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Prazo de Envio:
                      </span>
                      <span className={isUrgent ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'}>
                        {Math.ceil(order.timeRemainingSeconds)}s restantes
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isUrgent ? 'bg-rose-500' : timePercentage < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${timePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Packing Progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Box className="w-3 h-3 text-slate-500" />
                        Montagem do Pacote:
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {Math.round(order.packProgress)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-150"
                        style={{ width: `${order.packProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions: Manual Pack Click vs Dispatch */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  {isReady ? (
                    <button
                      onClick={() => {
                        sound.playStamp();
                        sound.playTruck();
                        onShipOrder(order.id);
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Truck className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      Despachar Pacote ({formatCurrency(order.totalPrice + order.shippingCost)})
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          sound.playTape();
                          onPackOrder(order.id, 25);
                        }}
                        className="py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Package className="w-4 h-4 text-amber-400" />
                        Embalar (+25%)
                      </button>

                      <button
                        onClick={() => {
                          sound.playTape();
                          sound.playStamp();
                          onPackOrder(order.id, 100);
                        }}
                        className="py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        Turbo (100%)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Orders Stats Counter */}
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Total de Pedidos Entregues com Sucesso:</span>
          <strong className="text-white font-bold text-sm">{state.completedOrdersCount} encomendas</strong>
        </div>
        <div>
          <span>Receita Bruta Acumulada: </span>
          <strong className="text-emerald-400 font-bold">{formatCurrency(state.lifetimeRevenue)}</strong>
        </div>
      </div>
    </div>
  );
};
