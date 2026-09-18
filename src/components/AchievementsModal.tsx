import React from 'react';
import { GameState, Achievement } from '../types/game';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  Coins,
  Truck,
  Star,
  Users,
  Warehouse,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

interface AchievementsModalProps {
  state: GameState;
  onClose: () => void;
  onClaimAchievement: (achievementId: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  state,
  onClose,
  onClaimAchievement,
}) => {
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'PackageCheck':
        return PackageCheck;
      case 'Truck':
        return Truck;
      case 'Award':
        return Award;
      case 'Star':
        return Star;
      case 'Coins':
        return Coins;
      case 'TrendingUp':
        return TrendingUp;
      case 'Users':
        return Users;
      case 'Warehouse':
        return Warehouse;
      default:
        return Award;
    }
  };

  const handleClaim = (achId: string) => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
    sound.playSuccess();
    sound.playCash();
    onClaimAchievement(achId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Galeria de Conquistas & Marcos</h2>
              <p className="text-xs text-slate-400">Complete objetivos de negócio para resgatar bônus em dinheiro.</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of achievements */}
        <div className="p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-800/60">
          {state.achievements.map((ach) => {
            const Icon = getAchievementIcon(ach.icon);
            const progressPercent = Math.min(100, Math.round((ach.progress / ach.target) * 100));
            const isCompleted = ach.progress >= ach.target;
            const isClaimed = ach.isUnlocked;
            const canClaim = isCompleted && !isClaimed;

            return (
              <div key={ach.id} className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isClaimed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isCompleted
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{ach.title}</h3>
                      {isClaimed && (
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Resgatado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>

                    {/* Progress Bar */}
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {ach.progress.toLocaleString('pt-BR')} / {ach.target.toLocaleString('pt-BR')} ({progressPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reward / Claim button */}
                <div className="self-end sm:self-center shrink-0">
                  {canClaim ? (
                    <button
                      onClick={() => handleClaim(ach.id)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 animate-bounce"
                    >
                      <Coins className="w-4 h-4" />
                      Resgatar +{formatCurrency(ach.rewardMoney)}
                    </button>
                  ) : isClaimed ? (
                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      +{formatCurrency(ach.rewardMoney)}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-semibold bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      Recompensa: {formatCurrency(ach.rewardMoney)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>
            Conquistas desbloqueadas:{' '}
            <strong className="text-white">
              {state.achievements.filter((a) => a.isUnlocked).length} de {state.achievements.length}
            </strong>
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
