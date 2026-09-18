import React, { useState } from 'react';
import { GameState, BankLoan } from '../types/game';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Landmark,
  Wallet,
  PiggyBank,
  FileText,
  Percent,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  Star,
  Receipt,
  Users,
  Building,
  Target
} from 'lucide-react';

interface FinancialDashboardProps {
  state: GameState;
  onTakeLoan: (loanId: string) => void;
  onPayoffLoan: (loanId: string) => void;
  onDepositTreasury: (amount: number) => void;
  onWithdrawTreasury: (amount: number) => void;
  onHireAccountant: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  state,
  onTakeLoan,
  onPayoffLoan,
  onDepositTreasury,
  onWithdrawTreasury,
  onHireAccountant,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'banking' | 'taxes'>('overview');
  const [depositInput, setDepositInput] = useState<string>('500');
  const [withdrawInput, setWithdrawInput] = useState<string>('500');

  // Fixed and recurring daily costs
  const activeStaffSalaries = state.staff
    .filter((s) => s.hired)
    .reduce((acc, s) => acc + s.salaryPerDay, 0);

  const activeMarketingSpend = state.marketing
    .filter((m) => m.active)
    .reduce((acc, m) => acc + m.dailyCost, 0);

  const currentWarehouseRent = state.warehouses[state.warehouseTier].dailyRent;

  const activeLoansDaily = state.loans
    .filter((l) => l.active)
    .reduce((acc, l) => acc + l.dailyPayment, 0);

  // Taxes
  const taxRate = state.hiredAccountant ? 0.04 : 0.07;
  const estimatedTaxesToday = Math.round(state.todayRevenue * taxRate * 100) / 100;

  // Daily interest yield from Treasury
  const dailyYield = Math.round(state.treasury.investedCash * state.treasury.dailyInterestRate * 100) / 100;

  const totalFixedCosts = activeStaffSalaries + activeMarketingSpend + currentWarehouseRent + activeLoansDaily;
  const todayGross = state.todayRevenue;
  const todayDirectCosts = state.todayCogs + state.todayShipping + estimatedTaxesToday;
  const estimatedTodayNet = todayGross - todayDirectCosts - totalFixedCosts + dailyYield;

  // Advanced KPIs
  const completedOrders = Math.max(1, state.completedOrdersCount);
  const averageOrderValue = state.lifetimeRevenue > 0 ? state.lifetimeRevenue / completedOrders : 0;

  const totalMarketingSpent = state.marketing.reduce((acc, m) => acc + m.totalCostSpent, 0);
  const cac = completedOrders > 0 && totalMarketingSpent > 0 ? totalMarketingSpent / completedOrders : 0;
  const roas = totalMarketingSpent > 0 ? (state.lifetimeRevenue / totalMarketingSpent).toFixed(1) : '∞';
  const netMarginPercent =
    state.lifetimeRevenue > 0
      ? Math.round(((state.cash + state.treasury.investedCash) / state.lifetimeRevenue) * 100)
      : 0;

  // Chart Data preparation
  const chartData = [...state.financialHistory]
    .slice(0, 10)
    .reverse()
    .map((record) => ({
      name: `Dia ${record.day}`,
      Receita: Math.round(record.revenue),
      Custos: Math.round(record.cogs + record.shippingCost + record.salaries + record.marketingCost + record.rent + (record.taxes || 0)),
      Lucro: Math.round(record.netProfit),
    }));

  // If chart data is empty or only 1 day, add placeholder current day so charts look alive
  if (chartData.length < 2) {
    chartData.push({
      name: `Dia ${state.currentDay} (Hoje)`,
      Receita: Math.round(state.todayRevenue),
      Custos: Math.round(todayDirectCosts + totalFixedCosts),
      Lucro: Math.round(estimatedTodayNet),
    });
  }

  // Cost breakdown pie chart
  const costBreakdownData = [
    { name: 'CMV (Mercadorias)', value: Math.max(1, state.todayCogs), color: '#3b82f6' },
    { name: 'Fretes e Envios', value: Math.max(1, state.todayShipping), color: '#06b6d4' },
    { name: 'Marketing & Ads', value: Math.max(1, activeMarketingSpend), color: '#f59e0b' },
    { name: 'Salários Equipe', value: Math.max(1, activeStaffSalaries), color: '#a855f7' },
    { name: 'Aluguel Armazém', value: Math.max(1, currentWarehouseRent), color: '#ec4899' },
    { name: 'Tributos (NF-e)', value: Math.max(1, estimatedTaxesToday), color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                Controladoria & Tesouraria (CFO)
              </span>
              <span className="text-xs text-slate-400">Dia Fiscal {state.currentDay}</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">Centro Financeiro & Gestão de Capital</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Análise de demonstrativos contábeis, linhas de crédito bancário, rentabilidade de caixa e planejamento tributário.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('overview');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Visão Geral & DRE
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('banking');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'banking'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PiggyBank className="w-3.5 h-3.5" />
              Crédito & Tesouraria
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('taxes');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'taxes'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Tributos & NF-e
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Caixa Livre</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-white font-mono mt-1">
            {formatCurrency(state.cash)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Disponibilidade imediata</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Aplicação CDI</span>
            <PiggyBank className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-lg font-black text-teal-400 font-mono mt-1">
            {formatCurrency(state.treasury.investedCash)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">+{formatCurrency(dailyYield)}/dia juros</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ticket Médio</span>
            <Target className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-lg font-black text-white font-mono mt-1">
            {formatCurrency(averageOrderValue)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{completedOrders} compras</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CAC Médio</span>
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-black text-amber-300 font-mono mt-1">
            {cac > 0 ? formatCurrency(cac) : 'Orgânico'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Custo por cliente</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ROAS Anúncios</span>
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-black text-white font-mono mt-1">
            {roas}x
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Retorno de mídia</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Dívida Ativa</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-black text-rose-400 font-mono mt-1">
            {formatCurrency(state.loans.filter((l) => l.active).reduce((a, b) => a + b.remainingDebt, 0))}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">-{formatCurrency(activeLoansDaily)}/dia parcelas</div>
        </div>
      </div>

      {/* TAB 1: VISÃO GERAL & DRE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Area Chart: Revenue vs Net Profit (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">Evolução de Receita & Lucro Líquido</h3>
                  <p className="text-xs text-slate-400">Histórico de faturamento bruto vs margem diária</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Gráfico Interativo
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                      formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                    />
                    <Area type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRec)" />
                    <Area type="monotone" dataKey="Lucro" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLucro)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Breakdown of Costs (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-800 mb-2">
                  <h3 className="text-base font-extrabold text-white">Composição de Custos</h3>
                  <p className="text-xs text-slate-400">Distribuição percentual das saídas</p>
                </div>

                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costBreakdownData}
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {costBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#020617',
                          borderColor: '#1e293b',
                          borderRadius: '0.75rem',
                          fontSize: '11px',
                        }}
                        formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend items */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 pt-2 border-t border-slate-800">
                {costBreakdownData.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DRE - Demonstrativo de Resultado do Exercício */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Demonstrativo do Resultado do Exercício (DRE Oficial)
                </h3>
                <p className="text-xs text-slate-400">Fechamento analítico das receitas operacionais e deduções fiscais</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  Dia {state.currentDay}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Rubrica Contábil</th>
                    <th className="pb-2">Natureza</th>
                    <th className="pb-2 text-right">Hoje (Dia {state.currentDay})</th>
                    <th className="pb-2 text-right">Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="py-2 font-sans font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="text-emerald-400">(+)</span> Receita Bruta de Vendas (Produtos + Fretes)
                    </td>
                    <td className="py-2 text-slate-400 font-sans">Crédito</td>
                    <td className="py-2 text-right text-emerald-400 font-bold">{formatCurrency(todayGross)}</td>
                    <td className="py-2 text-right text-slate-200">{formatCurrency(state.lifetimeRevenue)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-300">
                      <span className="text-rose-400">(-)</span> Custo das Mercadorias Vendidas (CMV)
                    </td>
                    <td className="py-2 text-slate-400 font-sans">Custo Direto</td>
                    <td className="py-2 text-right text-rose-400">-{formatCurrency(state.todayCogs)}</td>
                    <td className="py-2 text-right text-slate-400">Variável</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-300">
                      <span className="text-rose-400">(-)</span> Custos de Envio & Transportadoras
                    </td>
                    <td className="py-2 text-slate-400 font-sans">Logística</td>
                    <td className="py-2 text-right text-rose-400">-{formatCurrency(state.todayShipping)}</td>
                    <td className="py-2 text-right text-slate-400">Variável</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-300">
                      <span className="text-rose-400">(-)</span> Tributos e Impostos ({Math.round(taxRate * 100)}%)
                    </td>
                    <td className="py-2 text-slate-400 font-sans">Fiscal</td>
                    <td className="py-2 text-right text-rose-400">-{formatCurrency(estimatedTaxesToday)}</td>
                    <td className="py-2 text-right text-slate-400">Variável</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-300">
                      <span className="text-rose-400">(-)</span> Tráfego Pago & Marketing Digital
                    </td>
                    <td className="py-2 text-slate-400 font-sans">Despesa Fixa</td>
                    <td className="py-2 text-right text-rose-400">-{formatCurrency(activeMarketingSpend)}</td>
                    <td className="py-2 text-right text-slate-400">Por campanha</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-300">
                      <span className="text-rose-400">(-)</span> Folha de Pagamento & Salários
                    </td>
                    <td className="py-2 text-slate-400 font-sans">RH Operacional</td>
                    <td className="py-2 text-right text-rose-400">-{formatCurrency(activeStaffSalaries)}</td>
                    <td className="py-2 text-right text-slate-400">{state.staff.filter((s) => s.hired).length} colaboradores</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-300">
                      <span className="text-rose-400">(-)</span> Aluguel Operacional do Armazém
                    </td>
                    <td className="py-2 text-slate-400 font-sans">Infraestrutura</td>
                    <td className="py-2 text-right text-rose-400">-{formatCurrency(currentWarehouseRent)}</td>
                    <td className="py-2 text-right text-slate-400">{state.warehouses[state.warehouseTier].name}</td>
                  </tr>
                  {activeLoansDaily > 0 && (
                    <tr>
                      <td className="py-2 font-sans text-slate-300">
                        <span className="text-rose-400">(-)</span> Amortização de Empréstimos Bancários
                      </td>
                      <td className="py-2 text-slate-400 font-sans">Financeiro</td>
                      <td className="py-2 text-right text-rose-400">-{formatCurrency(activeLoansDaily)}</td>
                      <td className="py-2 text-right text-slate-400">Bancário</td>
                    </tr>
                  )}
                  {dailyYield > 0 && (
                    <tr>
                      <td className="py-2 font-sans text-emerald-300">
                        <span className="text-emerald-400">(+)</span> Rendimento de Aplicações Financeiras (CDI)
                      </td>
                      <td className="py-2 text-slate-400 font-sans">Receita Financeira</td>
                      <td className="py-2 text-right text-emerald-400">+{formatCurrency(dailyYield)}</td>
                      <td className="py-2 text-right text-slate-400">Renda Fixa</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-slate-700 bg-slate-950/60 font-bold text-sm">
                    <td className="py-3 font-sans text-white">(=) Lucro Líquido Operacional Previsto</td>
                    <td className="py-3 text-slate-400 font-sans text-xs">Resultado</td>
                    <td
                      className={`py-3 text-right text-base ${
                        estimatedTodayNet >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {estimatedTodayNet >= 0 ? '+' : ''}
                      {formatCurrency(estimatedTodayNet)}
                    </td>
                    <td className="py-3 text-right text-slate-300 text-xs font-sans">
                      Margem: {todayGross > 0 ? Math.round((estimatedTodayNet / todayGross) * 100) : 0}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CRÉDITO & TESOURARIA */}
      {activeTab === 'banking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Treasury Fund (CDI 100%) - 5 cols */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Tesouraria & Renda Fixa (CDI)</h3>
                  <p className="text-xs text-slate-400">Aplique o caixa ocioso da empresa para render 0.3% ao dia</p>
                </div>
              </div>

              <div className="mt-4 bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Saldo Aplicado:</span>
                  <span className="text-lg font-black text-teal-400 font-mono">
                    {formatCurrency(state.treasury.investedCash)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Taxa de Rendimento:</span>
                  <span className="text-emerald-400 font-bold font-mono">0.30% ao dia (~10% ao mês)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Rendimento Estimado Hoje:</span>
                  <span className="text-white font-bold font-mono">+{formatCurrency(dailyYield)}</span>
                </div>
              </div>

              {/* Deposit / Withdraw Controls */}
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                    Aplicar Capital no Fundo:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={depositInput}
                      onChange={(e) => setDepositInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                      placeholder="Valor em R$"
                    />
                    <button
                      onClick={() => {
                        const val = parseFloat(depositInput);
                        if (val > 0 && state.cash >= val) {
                          sound.playCash();
                          onDepositTreasury(val);
                        } else {
                          sound.playWarning();
                        }
                      }}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-teal-500/20"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                    Resgatar para Caixa Operacional:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={withdrawInput}
                      onChange={(e) => setWithdrawInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Valor em R$"
                    />
                    <button
                      onClick={() => {
                        const val = parseFloat(withdrawInput);
                        if (val > 0 && state.treasury.investedCash >= val) {
                          sound.playCash();
                          onWithdrawTreasury(val);
                        } else {
                          sound.playWarning();
                        }
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700"
                    >
                      Resgatar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              * Liquidez diária com resgate imediato a qualquer momento sem carência.
            </div>
          </div>

          {/* Bank Loans & Financing (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Linhas de Crédito & Financiamento</h3>
                <p className="text-xs text-slate-400">
                  Adquira liquidez instantânea para investir em estoque, contratar colaboradores ou expandir galpões
                </p>
              </div>
              <Landmark className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="space-y-4">
              {state.loans.map((loan) => {
                const canPayoff = state.cash >= loan.remainingDebt;

                return (
                  <div
                    key={loan.id}
                    className={`bg-slate-950 rounded-2xl p-4 border transition-all ${
                      loan.active ? 'border-amber-500/40 bg-slate-950/90' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{loan.title}</h4>
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {loan.institution}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Crédito Liberado:</span>
                            <strong className="text-emerald-400 font-mono">
                              {formatCurrency(loan.principal)}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Parcela Diária:</span>
                            <strong className="text-rose-400 font-mono">
                              {formatCurrency(loan.dailyPayment)}/dia
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Duração:</span>
                            <strong className="text-slate-300 font-mono">{loan.totalDays} dias</strong>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0">
                        {loan.active ? (
                          <div className="space-y-2 text-right">
                            <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 block text-center">
                              Ativo ({loan.daysPaid}/{loan.totalDays} dias)
                            </span>
                            <button
                              onClick={() => {
                                if (canPayoff) {
                                  sound.playCash();
                                  onPayoffLoan(loan.id);
                                } else {
                                  sound.playWarning();
                                }
                              }}
                              disabled={!canPayoff}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                canPayoff
                                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              Quitar ({formatCurrency(loan.remainingDebt)})
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playCash();
                              confetti({ particleCount: 40, spread: 50 });
                              onTakeLoan(loan.id);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                          >
                            <DollarSign className="w-4 h-4" />
                            Contratar Crédito
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRIBUTOS & NF-E */}
      {activeTab === 'taxes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white">Planejamento Tributário & Emissão de NF-e</h3>
              <p className="text-xs text-slate-400">
                Garanta conformidade com o Fisco e otimize a carga tributária da sua empresa de e-commerce
              </p>
            </div>
            <Receipt className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Regime Tributário Vigente: Simples Nacional (Anexo I)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tributação unificada abrangendo ICMS, PIS, COFINS e IRPJ sobre a receita bruta faturada. A alíquota nominal padrão é de 7.0%.
              </p>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Alíquota Tributária Efetiva:</span>
                  <strong className="text-white font-mono">{Math.round(taxRate * 100)}% das vendas</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Tributos recolhidos hoje:</span>
                  <strong className="text-rose-400 font-mono">-{formatCurrency(estimatedTaxesToday)}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Status da Receita Federal:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> CNPJ Regular & Regularizado
                  </span>
                </div>
              </div>
            </div>

            {/* Accountant hiring card */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Consultoria & Elisão Fiscal Especializada
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Contrate um Escritório de Contabilidade Especializado em E-Commerce para estruturar créditos fiscais e reduzir sua alíquota de impostos de <strong>7% para 4%</strong>!
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                {state.hiredAccountant ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Contador Ativo: Alíquota reduzida para 4% permanentemente!
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (state.cash >= 1800) {
                        sound.playSuccess();
                        onHireAccountant();
                      } else {
                        sound.playWarning();
                      }
                    }}
                    disabled={state.cash < 1800}
                    className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                      state.cash >= 1800
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-md shadow-teal-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Contratar Consultoria Contábil ({formatCurrency(1800)})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
