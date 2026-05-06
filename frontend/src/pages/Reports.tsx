import { BarChart3, Download, TrendingUp, TrendingDown, Target, Zap, Clock } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { useStore } from '../store/useStore';
import { EquityCurve } from '../components/charts/EquityCurve';
import { PnLBarChart } from '../components/charts/PnLBarChart';
import { WinRateDonut } from '../components/charts/WinRateDonut';
import { SessionHeatmap } from '../components/charts/SessionHeatmap';
import { Badge } from '../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { clsx } from 'clsx';
import { useMemo } from 'react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-surface border border-surface-border rounded-lg p-2 text-xs shadow-card">
      <div className="text-slate-400">{label}</div>
      <div className={val >= 0 ? 'text-brand-400 font-bold' : 'text-red-400 font-bold'}>
        {val >= 0 ? '+' : ''}${typeof val === 'number' ? val.toFixed(0) : val}
      </div>
    </div>
  );
};

export function Reports() {
  const { metrics, trades } = useStore();

  const strategyData = useMemo(() => {
    const m = new Map<string, { wins: number; losses: number; pnl: number }>();
    trades.forEach(t => {
      if (!m.has(t.strategy)) m.set(t.strategy, { wins: 0, losses: 0, pnl: 0 });
      const d = m.get(t.strategy)!;
      d.pnl += t.pnl;
      if (t.status === 'WIN') d.wins++;
      else if (t.status === 'LOSS') d.losses++;
    });
    return Array.from(m.entries())
      .map(([name, d]) => ({
        name,
        pnl: parseFloat(d.pnl.toFixed(0)),
        winRate: Math.round(d.wins / (d.wins + d.losses) * 100),
        trades: d.wins + d.losses,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const emotionData = useMemo(() => {
    const m = new Map<string, { wins: number; total: number; pnl: number }>();
    trades.forEach(t => {
      if (!m.has(t.emotion)) m.set(t.emotion, { wins: 0, total: 0, pnl: 0 });
      const d = m.get(t.emotion)!;
      d.total++;
      d.pnl += t.pnl;
      if (t.status === 'WIN') d.wins++;
    });
    return Array.from(m.entries()).map(([emotion, d]) => ({
      emotion: emotion.slice(0, 8),
      winRate: Math.round(d.wins / d.total * 100),
      trades: d.total,
      pnl: parseFloat(d.pnl.toFixed(0)),
    })).sort((a, b) => b.winRate - a.winRate);
  }, [trades]);

  const radarData = [
    { subject: 'Win Rate', A: metrics.winRate, fullMark: 100 },
    { subject: 'Profit Factor', A: Math.min(metrics.profitFactor * 20, 100), fullMark: 100 },
    { subject: 'Risk Mgmt', A: Math.max(0, 100 - metrics.maxDrawdown * 5), fullMark: 100 },
    { subject: 'Consistency', A: 70, fullMark: 100 },
    { subject: 'R:R Avg', A: Math.min(metrics.avgRR * 20, 100), fullMark: 100 },
    { subject: 'Discipline', A: 75, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Performance Reports"
        subtitle="Comprehensive trading analytics"
        action={
          <button className="btn-secondary text-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        }
      />

      <div className="pt-16 p-6 space-y-6">
        {/* KPI Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total P&L', value: `$${metrics.totalPnl.toLocaleString()}`, up: metrics.totalPnl > 0, icon: TrendingUp },
            { label: 'Win Rate', value: `${metrics.winRate}%`, up: metrics.winRate >= 55, icon: Target },
            { label: 'Profit Factor', value: `${metrics.profitFactor}x`, up: metrics.profitFactor >= 1.5, icon: BarChart3 },
            { label: 'Avg R:R', value: `1:${metrics.avgRR}`, up: metrics.avgRR >= 1.5, icon: Zap },
            { label: 'Max DD', value: `${metrics.maxDrawdown}%`, up: metrics.maxDrawdown < 10, icon: TrendingDown },
            { label: 'Expectancy', value: `$${metrics.expectancy}`, up: metrics.expectancy > 0, icon: Clock },
          ].map(m => (
            <div key={m.label} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{m.label}</span>
                <m.icon className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <div className={clsx('text-xl font-bold', m.up ? 'text-brand-400' : 'text-red-400')}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Equity + Win Rate row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2">
            <h3 className="section-title text-base mb-1">Equity Curve</h3>
            <p className="section-subtitle mb-4">90-day performance</p>
            <EquityCurve height={200} />
          </div>
          <div className="card p-5">
            <h3 className="section-title text-base mb-1">Win/Loss Distribution</h3>
            <p className="section-subtitle mb-4">Trade outcomes</p>
            <WinRateDonut />
          </div>
        </div>

        {/* Strategy Performance */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title text-base">Strategy Performance</h3>
              <p className="section-subtitle">P&L by trading strategy</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={strategyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,53,80,0.6)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {strategyData.map((d, i) => (
                  <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {strategyData.slice(0, 4).map(s => (
              <div key={s.name} className="bg-dark-300 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">{s.name}</div>
                <div className={clsx('text-sm font-bold', s.pnl >= 0 ? 'text-brand-400' : 'text-red-400')}>
                  {s.pnl >= 0 ? '+' : ''}${s.pnl.toLocaleString()}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant={s.winRate >= 60 ? 'profit' : 'warn'} size="xs">{s.winRate}%</Badge>
                  <span className="text-xs text-slate-600">{s.trades}T</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Psychology + Session Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Emotion Analysis */}
          <div className="card p-5">
            <h3 className="section-title text-base mb-1">Psychology Analysis</h3>
            <p className="section-subtitle mb-4">Win rate by emotional state</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={emotionData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barSize={14} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,53,80,0.6)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <YAxis type="category" dataKey="emotion" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="bg-surface border border-surface-border rounded-lg p-2 text-xs shadow-card">
                      <div className="text-white font-semibold">{label}</div>
                      <div className="text-brand-400">{payload[0].value}% win rate</div>
                      <div className="text-slate-500">{payload[0].payload.trades} trades</div>
                    </div>
                  ) : null}
                />
                <Bar dataKey="winRate" radius={[0, 3, 3, 0]}>
                  {emotionData.map((d, i) => (
                    <Cell key={i} fill={d.winRate >= 65 ? '#10b981' : d.winRate >= 50 ? '#3b82f6' : '#ef4444'} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Trader Radar */}
          <div className="card p-5">
            <h3 className="section-title text-base mb-1">Trader Profile</h3>
            <p className="section-subtitle mb-4">Overall performance radar</p>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(42,53,80,0.8)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily P&L + Session Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2">
            <h3 className="section-title text-base mb-1">Daily P&L Distribution</h3>
            <p className="section-subtitle mb-4">Last 21 trading sessions</p>
            <PnLBarChart height={180} />
          </div>
          <div className="card p-5">
            <h3 className="section-title text-base mb-1">Session Heatmap</h3>
            <p className="section-subtitle mb-4">P&L by session & weekday</p>
            <SessionHeatmap />
          </div>
        </div>

        {/* Detailed Stats Table */}
        <div className="card p-5">
          <h3 className="section-title text-base mb-4">Full Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Trades', value: metrics.totalTrades },
              { label: 'Winning Trades', value: metrics.winTrades },
              { label: 'Losing Trades', value: metrics.lossTrades },
              { label: 'Breakeven', value: metrics.breakevenTrades },
              { label: 'Gross Profit', value: `$${(metrics.avgWin * metrics.winTrades).toFixed(0)}` },
              { label: 'Gross Loss', value: `$${Math.abs(metrics.avgLoss * metrics.lossTrades).toFixed(0)}` },
              { label: 'Avg Win', value: `+$${metrics.avgWin.toFixed(0)}` },
              { label: 'Avg Loss', value: `$${metrics.avgLoss.toFixed(0)}` },
              { label: 'Best Trade', value: `+$${metrics.bestTrade.toFixed(0)}` },
              { label: 'Worst Trade', value: `$${metrics.worstTrade.toFixed(0)}` },
              { label: 'Max Win Streak', value: metrics.maxConsecutiveWins },
              { label: 'Max Loss Streak', value: metrics.maxConsecutiveLosses },
              { label: 'Avg Hold Time', value: `${metrics.avgHoldTime}m` },
              { label: 'Sharpe Ratio', value: metrics.sharpeRatio },
              { label: 'Trading Days', value: metrics.tradingDays },
              { label: 'Avg Daily P&L', value: `$${metrics.avgDailyPnl.toFixed(0)}` },
            ].map(s => (
              <div key={s.label} className="bg-dark-300 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                <div className="text-sm font-semibold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
