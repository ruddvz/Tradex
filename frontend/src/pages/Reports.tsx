import { useMemo, useState } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, Target, Zap, Clock } from 'lucide-react';
import { subDays, parseISO } from 'date-fns';
import { Header } from '../components/layout/Header';
import { useStore } from '../store/useStore';
import { EquityCurve } from '../components/charts/EquityCurve';
import { PnLBarChart } from '../components/charts/PnLBarChart';
import { WinRateDonut } from '../components/charts/WinRateDonut';
import { SessionHeatmap } from '../components/charts/SessionHeatmap';
import { Badge } from '../components/ui/Badge';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { computeMetrics } from '../data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import { clsx } from 'clsx';

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="bg-surface border border-surface-border rounded-lg p-2 text-xs shadow-card">
      <div className="text-slate-400">{label}</div>
      <div className={val >= 0 ? 'text-brand-400 font-bold' : 'text-red-400 font-bold'}>
        {val >= 0 ? '+' : ''}${typeof val === 'number' ? val.toFixed(0) : val}
      </div>
    </div>
  );
};

const RANGE_KEYS = [
  { key: '7d' as const, label: '7D' },
  { key: '30d' as const, label: '30D' },
  { key: '90d' as const, label: '90D' },
  { key: 'all' as const, label: 'All' },
];

const TAB_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'performance', label: 'Performance' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'strategies', label: 'Strategies' },
  { id: 'behavior', label: 'Behavior' },
];

export function Reports() {
  const { trades, selectedDateRange, setDateRange } = useStore();
  const [tab, setTab] = useState('overview');

  const tradesInRange = useMemo(() => {
    if (selectedDateRange === 'all') return trades;
    const days =
      selectedDateRange === '7d' ? 7 : selectedDateRange === '30d' ? 30 : 90;
    const cutoff = subDays(new Date(), days);
    return trades.filter(t => parseISO(t.entryTime) >= cutoff);
  }, [trades, selectedDateRange]);

  const m = useMemo(() => computeMetrics(tradesInRange), [tradesInRange]);

  const strategyData = useMemo(() => {
    const map = new Map<string, { wins: number; losses: number; pnl: number }>();
    tradesInRange.forEach(t => {
      if (!map.has(t.strategy)) map.set(t.strategy, { wins: 0, losses: 0, pnl: 0 });
      const d = map.get(t.strategy)!;
      d.pnl += t.pnl;
      if (t.status === 'WIN') d.wins++;
      else if (t.status === 'LOSS') d.losses++;
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({
        name,
        pnl: parseFloat(d.pnl.toFixed(0)),
        winRate: Math.round((d.wins / (d.wins + d.losses || 1)) * 100),
        trades: d.wins + d.losses,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [tradesInRange]);

  const emotionData = useMemo(() => {
    const map = new Map<string, { wins: number; total: number; pnl: number }>();
    tradesInRange.forEach(t => {
      if (!map.has(t.emotion)) map.set(t.emotion, { wins: 0, total: 0, pnl: 0 });
      const d = map.get(t.emotion)!;
      d.total++;
      d.pnl += t.pnl;
      if (t.status === 'WIN') d.wins++;
    });
    return Array.from(map.entries())
      .map(([emotion, d]) => ({
        emotion: emotion.slice(0, 8),
        winRate: Math.round((d.wins / d.total) * 100),
        trades: d.total,
        pnl: parseFloat(d.pnl.toFixed(0)),
      }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [tradesInRange]);

  const radarData = [
    { subject: 'Win Rate', A: m.winRate, fullMark: 100 },
    { subject: 'Profit Factor', A: Math.min(m.profitFactor * 20, 100), fullMark: 100 },
    { subject: 'Risk Mgmt', A: Math.max(0, 100 - m.maxDrawdown * 5), fullMark: 100 },
    { subject: 'Consistency', A: Math.min(100, m.winRate * 0.9 + 10), fullMark: 100 },
    { subject: 'R:R Avg', A: Math.min(m.avgRR * 20, 100), fullMark: 100 },
    { subject: 'Discipline', A: 75, fullMark: 100 },
  ];

  const kpiRow = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 motion-tab">
      {[
        { label: 'Total P&L', value: `$${m.totalPnl.toLocaleString()}`, up: m.totalPnl > 0, icon: TrendingUp },
        { label: 'Win Rate', value: `${m.winRate}%`, up: m.winRate >= 55, icon: Target },
        { label: 'Profit Factor', value: `${m.profitFactor}x`, up: m.profitFactor >= 1.5, icon: BarChart3 },
        { label: 'Avg R:R', value: `1:${m.avgRR}`, up: m.avgRR >= 1.5, icon: Zap },
        { label: 'Max DD', value: `${m.maxDrawdown}%`, up: m.maxDrawdown < 10, icon: TrendingDown },
        { label: 'Expectancy', value: `$${m.expectancy}`, up: m.expectancy > 0, icon: Clock },
      ].map(row => (
        <div key={row.label} className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">{row.label}</span>
            <row.icon className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className={clsx('text-xl font-bold', row.up ? 'text-brand-400' : 'text-red-400')}>{row.value}</div>
        </div>
      ))}
    </div>
  );

  const equityWinRow = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card p-5 lg:col-span-2 min-h-[280px]">
        <h3 className="section-title text-base mb-1">Equity curve</h3>
        <p className="section-subtitle mb-4">Selected range (demo uses full equity series)</p>
        <EquityCurve height={220} />
      </div>
      <div className="card p-5">
        <h3 className="section-title text-base mb-1">Win / loss</h3>
        <p className="section-subtitle mb-4">Distribution in range</p>
        <WinRateDonut />
      </div>
    </div>
  );

  const strategyBlock = (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title text-base">Strategy performance</h3>
          <p className="section-subtitle">P&amp;L by strategy</p>
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
              <Badge variant={s.winRate >= 60 ? 'profit' : 'warn'} size="xs">
                {s.winRate}%
              </Badge>
              <span className="text-xs text-slate-600">{s.trades}T</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const psychologyRow = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-5">
        <h3 className="section-title text-base mb-1">Psychology analysis</h3>
        <p className="section-subtitle mb-4">Win rate by emotion</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={emotionData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barSize={14} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,53,80,0.6)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
            <YAxis type="category" dataKey="emotion" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="bg-surface border border-surface-border rounded-lg p-2 text-xs shadow-card">
                    <div className="text-white font-semibold">{label}</div>
                    <div className="text-brand-400">{payload[0].value}% win rate</div>
                    <div className="text-slate-500">{payload[0].payload.trades} trades</div>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="winRate" radius={[0, 3, 3, 0]}>
              {emotionData.map((d, i) => (
                <Cell key={i} fill={d.winRate >= 65 ? '#10b981' : d.winRate >= 50 ? '#3b82f6' : '#ef4444'} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card p-5">
        <h3 className="section-title text-base mb-1">Trader profile</h3>
        <p className="section-subtitle mb-4">Radar for selected range</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(42,53,80,0.8)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
            <Radar dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const sessionDailyRow = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card p-5 lg:col-span-2">
        <h3 className="section-title text-base mb-1">Daily P&amp;L distribution</h3>
        <p className="section-subtitle mb-4">Recent sessions</p>
        <PnLBarChart height={180} />
      </div>
      <div className="card p-5">
        <h3 className="section-title text-base mb-1">Session heatmap</h3>
        <p className="section-subtitle mb-4">By session &amp; weekday</p>
        <SessionHeatmap />
      </div>
    </div>
  );

  const fullStats = (
    <div className="card p-5">
      <h3 className="section-title text-base mb-4">Full statistics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Trades', value: m.totalTrades },
          { label: 'Winning Trades', value: m.winTrades },
          { label: 'Losing Trades', value: m.lossTrades },
          { label: 'Breakeven', value: m.breakevenTrades },
          { label: 'Gross Profit', value: `$${(m.avgWin * m.winTrades).toFixed(0)}` },
          { label: 'Gross Loss', value: `$${Math.abs(m.avgLoss * m.lossTrades).toFixed(0)}` },
          { label: 'Avg Win', value: `+$${m.avgWin.toFixed(0)}` },
          { label: 'Avg Loss', value: `$${m.avgLoss.toFixed(0)}` },
          { label: 'Best Trade', value: `+$${m.bestTrade.toFixed(0)}` },
          { label: 'Worst Trade', value: `$${m.worstTrade.toFixed(0)}` },
          { label: 'Max Win Streak', value: m.maxConsecutiveWins },
          { label: 'Max Loss Streak', value: m.maxConsecutiveLosses },
          { label: 'Avg Hold Time', value: `${m.avgHoldTime}m` },
          { label: 'Sharpe Ratio', value: m.sharpeRatio },
          { label: 'Trading Days', value: m.tradingDays },
          { label: 'Avg Daily P&L', value: `$${m.avgDailyPnl.toFixed(0)}` },
        ].map(s => (
          <div key={s.label} className="bg-dark-300 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">{s.label}</div>
            <div className="text-sm font-semibold text-white">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const emptyRange = tradesInRange.length === 0;

  return (
    <div className="min-h-screen">
      <Header
        title="Reports"
        subtitle="Performance analytics for the selected range"
        action={
          <button type="button" className="no-print btn-secondary text-sm" onClick={() => window.print()}>
            <Download className="w-4 h-4" /> Export PDF
          </button>
        }
      />

      <div className="page-shell px-6 pt-4 pb-8 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {RANGE_KEYS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={clsx('chip', selectedDateRange === key && 'chip-active')}
                onClick={() => setDateRange(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">{tradesInRange.length} trades in range</p>
        </div>

        <SegmentedControl items={TAB_ITEMS} value={tab} onChange={setTab} />

        {emptyRange ? (
          <div className="card p-12 text-center text-slate-500">
            <p className="font-medium text-slate-300">No trades in this range.</p>
            <p className="text-sm mt-2">Widen the timeframe or log more trades.</p>
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {kpiRow}
                {equityWinRow}
                {sessionDailyRow}
                {strategyBlock}
                {fullStats}
              </div>
            )}
            {tab === 'performance' && (
              <div className="space-y-6 animate-fade-in">
                {kpiRow}
                <div className="card p-5">
                  <h3 className="section-title text-base mb-1">Drawdown view</h3>
                  <p className="section-subtitle mb-4">% off equity peak</p>
                  <EquityCurve showDrawdown height={200} />
                </div>
                {equityWinRow}
                {fullStats}
              </div>
            )}
            {tab === 'sessions' && (
              <div className="space-y-6 animate-fade-in">
                {kpiRow}
                {sessionDailyRow}
              </div>
            )}
            {tab === 'strategies' && (
              <div className="space-y-6 animate-fade-in">
                {kpiRow}
                {strategyBlock}
              </div>
            )}
            {tab === 'behavior' && (
              <div className="space-y-6 animate-fade-in">
                {kpiRow}
                {psychologyRow}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
