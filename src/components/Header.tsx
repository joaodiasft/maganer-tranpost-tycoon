import React, { useState } from 'react';
import { GameState } from '../types/game';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';
import {
  Store,
  DollarSign,
  TrendingUp,
  Star,
  Calendar,
  Volume2,
  VolumeX,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Pencil,
  Check,
  Award
} from 'lucide-react';

interface HeaderProps {
  state: GameState;
  onUpdateCompanyName: (name: string) => void;
  onSetGameSpeed: (speed: 0 | 1 | 2 | 3) => void;
  onToggleSound: () => void;
  onResetGame: () => void;
  onOpenAchievements: () => void;
  unclaimedAchievementsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onUpdateCompanyName,
  onSetGameSpeed,
  onToggleSound,
  onResetGame,
  onOpenAchievements,
  unclaimedAchievementsCount,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(state.companyName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateCompanyName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const todayNetProfit = state.todayRevenue - (state.todayCogs + state.todayShipping);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Company Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold">
            <Store className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-sm font-bold text-white px-2 py-0.5 rounded focus:outline-none focus:border-emerald-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded"
                    title="Salvar Nome"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                  <h1 className="text-base font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                    {state.companyName}
                  </h1>
                  <Pencil className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                E-Commerce
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>{state.warehouses[state.warehouseTier]?.name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium">
                {state.activeVisitors} visitantes agora
              </span>
            </p>
          </div>
        </div>

        {/* Core Financial & Rating Metrics */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          {/* Balance */}
          <div className="bg-slate-950/80 border border-slate-800/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4 font-bold" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Saldo em Caixa</div>
              <div className="text-sm sm:text-base font-black text-emerald-400 tracking-tight">
                {formatCurrency(state.cash)}
              </div>
            </div>
          </div>

          {/* Today's Profit */}
          <div className="hidden sm:flex bg-slate-950/80 border border-slate-800/80 px-3.5 py-1.5 rounded-xl items-center gap-2.5 shadow-inner">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${todayNetProfit >= 0 ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Lucro Hoje</div>
              <div className={`text-sm font-bold ${todayNetProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                {todayNetProfit >= 0 ? '+' : ''}{formatCurrency(todayNetProfit)}
              </div>
            </div>
          </div>

          {/* Reputation */}
          <div className="bg-slate-950/80 border border-slate-800/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Reputação</div>
              <div className="text-sm sm:text-base font-black text-amber-300">
                {Math.round(state.reputation)}% <span className="text-xs text-slate-400 font-normal">({(state.reputation / 20).toFixed(1)}★)</span>
              </div>
            </div>
          </div>

          {/* Day & Progress */}
          <div className="bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2.5 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center justify-between gap-2">
                <span>Dia {state.currentDay}</span>
                <span className="text-[9px] text-slate-500">{Math.round(state.dayProgress)}%</span>
              </div>
              <div className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-300 ease-linear"
                  style={{ width: `${state.dayProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Game Speed */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Speed Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => {
                sound.playClick();
                onSetGameSpeed(0);
              }}
              title="Pausar Simulação"
              className={`p-1.5 rounded text-xs transition-colors ${state.gameSpeed === 0 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onSetGameSpeed(1);
              }}
              title="Velocidade Normal (1x)"
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${state.gameSpeed === 1 ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              1x
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onSetGameSpeed(2);
              }}
              title="Velocidade Rápida (2x)"
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${state.gameSpeed === 2 ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              2x
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onSetGameSpeed(3);
              }}
              title="Velocidade Ultra (3x)"
              className={`px-2 py-1 rounded text-xs font-bold transition-colors flex items-center gap-0.5 ${state.gameSpeed === 3 ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <FastForward className="w-3 h-3" />
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            title={state.soundEnabled ? 'Silenciar Áudio' : 'Ativar Sons'}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {state.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Achievements Trophy */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAchievements();
            }}
            title="Conquistas e Recompensas"
            className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 hover:bg-slate-700 transition-colors"
          >
            <Award className="w-4 h-4" />
            {unclaimedAchievementsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unclaimedAchievementsCount}
              </span>
            )}
          </button>

          {/* Reset Save */}
          <button
            onClick={() => {
              if (window.confirm('Deseja reiniciar seu império do e-commerce do zero? Todo o progresso salvo será resetado.')) {
                onResetGame();
              }
            }}
            title="Reiniciar Jogo"
            className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
