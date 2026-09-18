import React, { useState } from 'react';
import { GameState, TruckRoute, TruckVehicle } from '../types/game';
import { INITIAL_TRUCK_ROUTES } from '../data/initialState';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Truck,
  Package,
  ArrowRight,
  Gauge,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Navigation as NavigationIcon,
  Zap,
  Boxes,
  Coins,
  Flame,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface TruckLoadingBayProps {
  state: GameState;
  onLoadBoxToTruck: (count: number) => void;
  onUnloadBoxFromTruck: () => void;
  onDispatchTruck: (route: TruckRoute) => void;
  onUpgradeTruckVehicle: (vehicleIndex: number) => void;
  onGoToWorkbench: () => void;
}

export const TruckLoadingBay: React.FC<TruckLoadingBayProps> = ({
  state,
  onLoadBoxToTruck,
  onUnloadBoxFromTruck,
  onDispatchTruck,
  onUpgradeTruckVehicle,
  onGoToWorkbench,
}) => {
  const currentVehicle = state.truckVehicles[state.currentTruckTier];
  const [selectedRouteId, setSelectedRouteId] = useState<string>(INITIAL_TRUCK_ROUTES[0].id);

  const selectedRoute =
    INITIAL_TRUCK_ROUTES.find((r) => r.id === selectedRouteId) || INITIAL_TRUCK_ROUTES[0];

  const fillPercentage = Math.min(
    100,
    Math.round((state.loadedTruckBoxes / currentVehicle.capacityBoxes) * 100)
  );

  const canDispatch =
    !state.activeTruckTrip &&
    state.loadedTruckBoxes >= selectedRoute.minBoxes;

  const handleManualLoadOne = () => {
    if (state.stagedBoxes <= 0) {
      sound.playWarning();
      return;
    }
    if (state.loadedTruckBoxes >= currentVehicle.capacityBoxes) {
      sound.playWarning();
      return;
    }
    sound.playBoxLoad();
    onLoadBoxToTruck(1);
  };

  const handleLoadAll = () => {
    const spaceLeft = currentVehicle.capacityBoxes - state.loadedTruckBoxes;
    const toLoad = Math.min(state.stagedBoxes, spaceLeft);
    if (toLoad <= 0) {
      sound.playWarning();
      return;
    }
    sound.playBoxLoad();
    onLoadBoxToTruck(toLoad);
  };

  const handleDispatch = () => {
    if (!canDispatch) {
      sound.playWarning();
      return;
    }
    sound.playTruckHorn();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    onDispatchTruck(selectedRoute);
  };

  // Active loaders working
  const hiredLoaders = state.staff.filter((s) => s.hired && s.role === 'loader');
  const loaderEfficiency = hiredLoaders.reduce((acc, l) => acc + l.efficiency, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Doca de Carga & Logística Rodoviária
              </span>
              <span className="text-xs text-slate-400">Frota Nível {state.currentTruckTier + 1} de 4</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
              Estação de Carregamento & Despacho de Cargas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empilhe os pacotes finalizados no baú do caminhão, escolha a rota de entrega interestadual e colete bônus de frete acelerado.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total de Viagens</div>
              <div className="text-base font-black text-emerald-400 font-mono">
                {state.totalTrucksDispatched} entregas
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Veículo Ativo</div>
              <div className="text-sm font-black text-white">{currentVehicle.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Active Trip Banner if truck is on route */}
      {state.activeTruckTrip && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center animate-pulse">
                <NavigationIcon className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Caminhão em Trânsito
                  </span>
                  <span className="text-xs text-slate-400">{state.activeTruckTrip.routeName}</span>
                </div>
                <h3 className="text-base font-black text-white mt-0.5">
                  Destino: {state.activeTruckTrip.destination}
                </h3>
                <p className="text-xs text-slate-400">
                  Transportando {state.activeTruckTrip.boxesCount} caixas • Previsão de Frete:{' '}
                  <strong className="text-emerald-400 font-mono">
                    +{formatCurrency(state.activeTruckTrip.freightPayout)}
                  </strong>
                </p>
              </div>
            </div>

            <div className="text-right sm:min-w-44">
              <div className="text-xs text-slate-400 font-mono">
                Tempo restante: <strong className="text-white">{Math.ceil(state.activeTruckTrip.remainingSeconds)}s</strong>
              </div>
              <div className="text-xs font-black text-indigo-400 mt-1">
                {Math.round(state.activeTruckTrip.progressPercent)}% Concluído
              </div>
            </div>
          </div>

          {/* Animated Highway Progress Bar */}
          <div className="mt-4 relative pt-2">
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 transition-all duration-300 relative"
                style={{ width: `${state.activeTruckTrip.progressPercent}%` }}
              />
            </div>
            {/* Moving truck icon indicator */}
            <div
              className="absolute -top-1.5 transition-all duration-300 -translate-x-1/2"
              style={{ left: `${Math.max(4, Math.min(96, state.activeTruckTrip.progressPercent))}%` }}
            >
              <div className="bg-slate-900 border border-indigo-400 text-indigo-400 p-1 rounded-full shadow-lg">
                <Truck className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Loading Dock (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Staging Pallet & Load Controls (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">Palete de Saída</h3>
                <p className="text-xs text-slate-400">Pacotes empacotados aguardando carga</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400">
                {state.stagedBoxes} caixas
              </span>
            </div>

            {/* Pallet Visualizer */}
            <div className="mt-4 bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  Pátio de Expedição:
                </span>
                <span className="font-mono text-emerald-400 font-bold">{state.stagedBoxes} prontas</span>
              </div>

              {state.stagedBoxes === 0 ? (
                <div className="py-8 text-center">
                  <Package className="w-10 h-10 text-slate-700 mx-auto stroke-1" />
                  <p className="text-xs text-slate-500 mt-2">Nenhum pacote pronto no palete.</p>
                  <button
                    onClick={onGoToWorkbench}
                    className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    Ir para Mesa de Pedidos <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {Array.from({ length: Math.min(24, state.stagedBoxes) }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-sm hover:border-amber-400/60 transition-colors"
                    >
                      <Package className="w-5 h-5 text-amber-400" />
                      <span className="text-[9px] font-mono text-amber-200/80 mt-0.5 font-bold">#CX-{i + 1}</span>
                    </div>
                  ))}
                  {state.stagedBoxes > 24 && (
                    <div className="col-span-4 text-center text-[10px] text-slate-500 py-1">
                      +{state.stagedBoxes - 24} pacotes adicionais empilhados no palete
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chapa/Loader Info */}
            <div className="mt-3 bg-slate-950/50 rounded-xl p-3 border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Carregadores Contratados:</span>
                <strong className="text-white">{hiredLoaders.length} funcionário(s)</strong>
              </div>
              {hiredLoaders.length > 0 ? (
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Carregando caixas automaticamente na esteira (+{loaderEfficiency * 2} cx/ciclo)</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 mt-1">
                  Contrate Chapas na aba 'Equipe' para automatizar o carregamento.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2 pt-3 border-t border-slate-800">
            <button
              onClick={handleManualLoadOne}
              disabled={state.stagedBoxes <= 0 || state.loadedTruckBoxes >= currentVehicle.capacityBoxes || !!state.activeTruckTrip}
              className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                state.stagedBoxes > 0 && state.loadedTruckBoxes < currentVehicle.capacityBoxes && !state.activeTruckTrip
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-98'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Package className="w-4 h-4" />
              Carregar 1 Caixa no Caminhão
            </button>

            <button
              onClick={handleLoadAll}
              disabled={state.stagedBoxes <= 0 || state.loadedTruckBoxes >= currentVehicle.capacityBoxes || !!state.activeTruckTrip}
              className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                state.stagedBoxes > 0 && state.loadedTruckBoxes < currentVehicle.capacityBoxes && !state.activeTruckTrip
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 active:scale-98'
                  : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <Layers className="w-4 h-4" />
              Carregar Capacidade Máxima Possível
            </button>
          </div>
        </div>

        {/* Center: Interactive Truck Bed & Cargo Bay (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{currentVehicle.name}</h3>
                  <p className="text-xs text-slate-400">{currentVehicle.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-slate-200">
                  {state.loadedTruckBoxes} / {currentVehicle.capacityBoxes} caixas ({fillPercentage}%)
                </span>
                {state.loadedTruckBoxes > 0 && !state.activeTruckTrip && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onUnloadBoxFromTruck();
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-500/10 rounded border border-rose-500/20"
                  >
                    Esvaziar Baú
                  </button>
                )}
              </div>
            </div>

            {/* Visual Truck Cargo Bed Grid */}
            <div className="mt-4 bg-slate-950 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  Compartimento de Carga Fechado (Baú):
                </span>
                <span className="text-[11px] text-slate-400">
                  {fillPercentage === 100 ? (
                    <strong className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Baú Lotado!
                    </strong>
                  ) : (
                    `Espaço livre: ${currentVehicle.capacityBoxes - state.loadedTruckBoxes} cx`
                  )}
                </span>
              </div>

              {/* Truck Bed Box Slots */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-dashed border-slate-700/80 min-h-[160px] flex items-center justify-center">
                {state.loadedTruckBoxes === 0 ? (
                  <div className="text-center py-6 text-slate-600">
                    <Truck className="w-12 h-12 mx-auto stroke-1 opacity-40 mb-2" />
                    <p className="text-xs font-medium">O baú do caminhão está vazio.</p>
                    <p className="text-[11px] text-slate-500">Carregue caixas do palete para preparar a viagem.</p>
                  </div>
                ) : (
                  <div className="w-full grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {Array.from({ length: state.loadedTruckBoxes }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-2 text-center shadow-sm flex flex-col items-center justify-center animate-in zoom-in-75 duration-150"
                      >
                        <Package className="w-4 h-4 text-emerald-400" />
                        <span className="text-[8px] font-mono text-emerald-300 mt-0.5 font-bold">CX-{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Choose Route for Dispatch */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Selecione a Rota de Distribuição:
                </span>
                <span className="text-[11px] text-slate-400">Mais caixas = mais frete faturado</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {INITIAL_TRUCK_ROUTES.map((route) => {
                  const isSelected = selectedRouteId === route.id;
                  const meetsMinBoxes = state.loadedTruckBoxes >= route.minBoxes;

                  return (
                    <div
                      key={route.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedRouteId(route.id);
                      }}
                      className={`cursor-pointer rounded-xl p-3 border transition-all text-xs ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-[12px]">{route.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>

                      <div className="text-[11px] text-slate-400">{route.destination}</div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-300">
                          <span>Duração:</span>
                          <strong className="font-mono text-white">{route.durationSeconds}s</strong>
                        </div>
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>Bônus de Frete:</span>
                          <strong className="font-mono">+{route.freightBonusPercent}%</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Carga Mínima:</span>
                          <strong
                            className={`font-mono ${
                              meetsMinBoxes ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {route.minBoxes} caixas
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dispatch Big Button */}
          <div className="mt-5 pt-3 border-t border-slate-800">
            <button
              onClick={handleDispatch}
              disabled={!canDispatch}
              className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                canDispatch
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20 active:scale-98 animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Truck className="w-5 h-5" />
              {state.activeTruckTrip
                ? 'Caminhão Atualmente em Rota...'
                : state.loadedTruckBoxes < selectedRoute.minBoxes
                ? `Carga Insuficiente (Mínimo de ${selectedRoute.minBoxes} caixas para esta rota)`
                : `DESPACHAR ${selectedRoute.name.toUpperCase()} (+${selectedRoute.freightBonusPercent}% FRETE)`}
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Vehicles Garage Upgrades */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white">Concessionária & Garagem da Frota</h3>
            <p className="text-xs text-slate-400">
              Evolua seus veículos de entrega para carregar mais caixas simultâneas e acelerar viagens interestaduais
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
            4 Categorias de Veículos
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.truckVehicles.map((veh, idx) => {
            const isCurrent = state.currentTruckTier === idx;
            const isUnlocked = veh.unlocked;
            const canAfford = state.cash >= veh.cost;

            return (
              <div
                key={veh.id}
                className={`bg-slate-950/80 border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/30 bg-slate-950'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                        Veículo Ativo
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white mt-3">{veh.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{veh.description}</p>

                  <div className="mt-3 bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Capacidade:</span>
                      <strong className="text-white font-mono">{veh.capacityBoxes} caixas</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Velocidade:</span>
                      <strong className="text-teal-400 font-mono">+{Math.round((veh.speedMultiplier - 1) * 100)}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Bônus Extra Frete:</span>
                      <strong className="text-emerald-400 font-mono">+{veh.freightBonusPercent}%</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80">
                  {isCurrent ? (
                    <div className="w-full py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold text-center rounded-lg border border-emerald-500/20">
                      Em Operação
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpgradeTruckVehicle(idx);
                      }}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Selecionar Veículo
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          sound.playSuccess();
                          onUpgradeTruckVehicle(idx);
                        } else {
                          sound.playWarning();
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-all ${
                        canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Comprar ({formatCurrency(veh.cost)})
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
