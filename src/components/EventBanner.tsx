import React from 'react';
import { MarketEvent } from '../types/game';
import { Flame, TrendingUp, AlertTriangle, Sparkles, Clock } from 'lucide-react';

interface EventBannerProps {
  events: MarketEvent[];
}

export const EventBanner: React.FC<EventBannerProps> = ({ events }) => {
  if (events.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-3 space-y-2">
      {events.map((evt) => {
        const isBlackFriday = evt.category === 'black_friday';
        const isCrisis = evt.category === 'crisis';
        const isTrend = evt.category === 'trend';

        return (
          <div
            key={evt.id}
            className={`px-4 py-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${
              isBlackFriday
                ? 'bg-gradient-to-r from-amber-950/80 via-rose-950/60 to-purple-950/70 border-amber-500/40 text-amber-200'
                : isCrisis
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                : isTrend
                ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isBlackFriday
                    ? 'bg-amber-500/20 text-amber-400 animate-bounce'
                    : isCrisis
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-indigo-500/20 text-indigo-400'
                }`}
              >
                {isBlackFriday ? (
                  <Flame className="w-5 h-5" />
                ) : isCrisis ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : isTrend ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white tracking-wide">{evt.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-black/40 border border-white/10">
                    {evt.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">{evt.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">
                Restam <strong className="text-white">{evt.daysLeft}</strong> dia(s)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
