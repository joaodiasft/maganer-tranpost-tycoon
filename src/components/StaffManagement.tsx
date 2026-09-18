import React from 'react';
import { GameState, StaffMember } from '../types/game';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';
import {
  Users,
  UserPlus,
  ArrowUpRight,
  UserX,
  Sparkles,
  DollarSign,
  Package,
  Headphones,
  TrendingUp,
  Briefcase,
  Truck
} from 'lucide-react';

interface StaffManagementProps {
  state: GameState;
  onHireStaff: (staffId: string) => void;
  onFireStaff: (staffId: string) => void;
  onTrainStaff: (staffId: string) => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  state,
  onHireStaff,
  onFireStaff,
  onTrainStaff,
}) => {
  const hiredStaff = state.staff.filter((s) => s.hired);
  const totalDailySalaries = hiredStaff.reduce((acc, s) => acc + s.salaryPerDay, 0);

  const getRoleInfo = (role: StaffMember['role']) => {
    switch (role) {
      case 'packer':
        return {
          title: 'Embalador de Encomendas',
          icon: Package,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          desc: 'Empacota pedidos automaticamente na linha de expedição.',
        };
      case 'loader':
        return {
          title: 'Operador de Carga & Doca',
          icon: Truck,
          color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
          desc: 'Carrega caixas automaticamente da doca para o baú do caminhão.',
        };
      case 'support':
        return {
          title: 'Atendente de Suporte',
          icon: Headphones,
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          desc: 'Resolve dúvidas e chamados, protegendo a reputação da loja.',
        };
      case 'marketer':
        return {
          title: 'Especialista em Tráfego',
          icon: TrendingUp,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          desc: 'Otimiza campanhas e atrai fluxo constante de compradores.',
        };
      case 'manager':
        return {
          title: 'Gerente de Operações',
          icon: Briefcase,
          color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
          desc: 'Supervisiona a logística e previne gargalos operacionais.',
        };
      default:
        return {
          title: 'Colaborador Operacional',
          icon: Users,
          color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
          desc: 'Auxilia nas operações diárias do centro de distribuição.',
        };
    }
  };

  const getTrainingCost = (member: StaffMember) => {
    return Math.round(member.costToHire * 1.5 * member.level);
  };

  return (
    <div className="space-y-6">
      {/* Staff Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Recursos Humanos & Equipe
              </span>
              <span className="text-xs text-slate-400">
                {hiredStaff.length} de {state.staff.length} Funcionários Contratados
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Equipe de Logística, Suporte & Marketing
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Contrate especialistas para automatizar o empacotamento, acelerar o atendimento e escalar sua operação.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Folha Salarial Diária</div>
              <div className="text-sm font-black text-white">
                <span className="text-emerald-400 font-mono">{formatCurrency(totalDailySalaries)}</span> / dia
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.staff.map((member) => {
          const roleInfo = getRoleInfo(member.role);
          const Icon = roleInfo.icon;
          const trainCost = getTrainingCost(member);
          const canAffordHire = state.cash >= member.costToHire;
          const canAffordTrain = state.cash >= trainCost;

          return (
            <div
              key={member.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 ${
                member.hired
                  ? 'border-emerald-500/40 shadow-md shadow-emerald-500/5 bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white leading-tight">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                          {roleInfo.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      member.hired ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Nível {member.level}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{roleInfo.desc}</p>

                {/* Salary & Efficiency Details */}
                <div className="mt-4 bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Eficiência Operacional:</span>
                    <strong className="text-emerald-400 font-mono">
                      {(member.efficiency * 100).toFixed(0)}%
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Salário Contratual:</span>
                    <strong className="text-white font-mono">
                      {formatCurrency(member.salaryPerDay)} / dia
                    </strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                {member.hired ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        if (canAffordTrain) {
                          sound.playSuccess();
                          onTrainStaff(member.id);
                        } else {
                          sound.playWarning();
                        }
                      }}
                      disabled={!canAffordTrain}
                      className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                        canAffordTrain
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Treinar ({formatCurrency(trainCost)})
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja demitir ${member.name}?`)) {
                          sound.playClick();
                          onFireStaff(member.id);
                        }
                      }}
                      className="py-2 px-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      Demitir
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (canAffordHire) {
                        sound.playCash();
                        onHireStaff(member.id);
                      } else {
                        sound.playWarning();
                      }
                    }}
                    disabled={!canAffordHire}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      canAffordHire
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    Contratar ({formatCurrency(member.costToHire)})
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
