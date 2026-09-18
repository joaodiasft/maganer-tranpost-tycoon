import React from 'react';
import { GameState, MarketingCampaign } from '../types/game';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';
import {
  Megaphone,
  Flame,
  Search,
  Video,
  Mail,
  Zap,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

interface MarketingHubProps {
  state: GameState;
  onToggleCampaign: (campaignId: string) => void;
}

export const MarketingHub: React.FC<MarketingHubProps> = ({
  state,
  onToggleCampaign,
}) => {
  const activeCampaigns = state.marketing.filter((m) => m.active);
  const totalDailyAdSpend = activeCampaigns.reduce((acc, m) => acc + m.dailyCost, 0);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'social':
        return Megaphone;
      case 'search':
        return Search;
      case 'influencer':
        return Video;
      case 'email':
        return Mail;
      case 'viral':
        return Flame;
      default:
        return Zap;
    }
  };

  return (
    <div className="space-y-6">
      {/* Marketing Overview & Daily Budget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Aquisição & Publicidade
              </span>
              <span className="text-xs text-slate-400">
                {activeCampaigns.length} de {state.marketing.length} Campanhas Ativas
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Marketing Digital & Gerador de Vendas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ative anúncios pagos nas redes e buscadores para inundar sua loja de novos clientes e pedidos.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Custo Total de Anúncios</div>
              <div className="text-sm font-black text-white">
                <span className="text-emerald-400 font-mono">{formatCurrency(totalDailyAdSpend)}</span> / dia
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.marketing.map((campaign) => {
          const Icon = getPlatformIcon(campaign.platform);

          return (
            <div
              key={campaign.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 ${
                campaign.active
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5 bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      campaign.active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      campaign.active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {campaign.active ? 'Em Veiculação' : 'Pausada'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3.5">{campaign.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{campaign.description}</p>

                {/* Metrics Breakdown */}
                <div className="mt-4 bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      Aumento de Tráfego:
                    </span>
                    <strong className="text-emerald-400 font-mono">+{campaign.trafficBonus}x visitantes</strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                      Bônus de Conversão:
                    </span>
                    <strong className="text-teal-300 font-mono">
                      +{(campaign.conversionBoost * 100).toFixed(0)}%
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 pt-1.5 border-t border-slate-800/80">
                    <span className="text-slate-400">Investimento Diário:</span>
                    <strong className="text-white font-mono">{formatCurrency(campaign.dailyCost)} / dia</strong>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleCampaign(campaign.id);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    campaign.active
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  }`}
                >
                  {campaign.active ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      Pausar Campanha
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Ativar Anúncios ({formatCurrency(campaign.dailyCost)}/dia)
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
