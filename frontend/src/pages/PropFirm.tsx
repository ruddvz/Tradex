import { Target, AlertTriangle, CheckCircle2, XCircle, TrendingUp, Calendar, BarChart3, Shield } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { ProgressRing } from '../components/ui/ProgressRing';
import { useStore } from '../store/useStore';
import { Badge } from '../components/ui/Badge';
import { PnLBarChart } from '../components/charts/PnLBarChart';
import { clsx } from 'clsx';
import { format, differenceInDays } from 'date-fns';

function ProgressBar({ value, max, color, label, sublabel }: { value: number; max: number; color: string; label: string; sublabel?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="text-white font-bold">${value.toLocaleString()} / ${max.toLocaleString()}</span>
      </div>
      <div className="h-3 bg-dark-300 rounded-full overflow-hidden border border-surface-border">
        <div
          className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
          style={{ width: `${pct}%`, background: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20" />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{sublabel || '0%'}</span>
        <span className={clsx('font-semibold', pct >= 80 ? 'text-amber-400' : 'text-slate-400')}>
          {pct.toFixed(1)}% {pct >= 100 ? '✓ Target Hit' : 'complete'}
        </span>
      </div>
    </div>
  );
}

const statusConfig = {
  active:   { label: 'Active',   color: 'bg-brand-500',  icon: CheckCircle2, badge: 'profit' as const },
  at_risk:  { label: 'At Risk',  color: 'bg-amber-500',  icon: AlertTriangle, badge: 'warn' as const },
  failed:   { label: 'Failed',   color: 'bg-red-500',    icon: XCircle,      badge: 'loss' as const },
  passed:   { label: 'Passed',   color: 'bg-blue-500',   icon: CheckCircle2, badge: 'info' as const },
};

export function PropFirm() {
  const { propChallenge, trades } = useStore();
  const cfg = statusConfig[propChallenge.status];
  const StatusIcon = cfg.icon;

  const profitPct = (propChallenge.currentPnl / propChallenge.profitTarget) * 100;
  const drawdownPct = (propChallenge.currentDrawdown / propChallenge.maxDrawdown) * 100;
  const dailyPct = (propChallenge.dailyLoss / propChallenge.dailyDrawdown) * 100;
  const daysRemaining = Math.max(0, differenceInDays(new Date(propChallenge.endDate), new Date()));
  const isExpiringSoon = daysRemaining <= 3;

  const challengeProgressPct = Math.min(100, profitPct);
  const ringTone = (drawdownPct >= 80 ? 'danger' : drawdownPct >= 55 ? 'warning' : 'success') as
    | 'danger'
    | 'warning'
    | 'success';

  const passProbability = Math.min(
    97,
    Math.max(
      12,
      Math.round(
        challengeProgressPct * 0.52 +
          (100 - Math.min(drawdownPct, 100)) * 0.33 +
          Math.min(15, daysRemaining * 0.5)
      )
    )
  );

  const totalCalendarDays = Math.max(
    1,
    differenceInDays(new Date(propChallenge.endDate), new Date(propChallenge.startDate))
  );

  const challengeTrades = trades.slice(0, propChallenge.trades);
  const challengeWins = challengeTrades.filter(t => t.status === 'WIN').length;

  return (
    <div className="min-h-screen">
      <Header title="Prop Firm Mode" subtitle="Track your funded challenge progress" />

      <div className="page-shell p-6 space-y-6">
        {/* Challenge selector + hero ring (Ui.md §10.4) */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Challenge</span>
          <select
            className="chip pr-8 appearance-none bg-dark-300 cursor-default"
            aria-label="Select challenge"
            disabled
            value={propChallenge.id}
          >
            <option value={propChallenge.id}>{propChallenge.name}</option>
          </select>
          <Badge variant="neutral" size="xs">
            {propChallenge.phase === 'phase1' ? 'Phase 1' : propChallenge.phase === 'phase2' ? 'Phase 2' : 'Funded'}
          </Badge>
          <Badge variant={cfg.badge}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </Badge>
        </div>

        <div className="card p-6 lg:p-8 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="relative shrink-0">
              <ProgressRing value={challengeProgressPct} size={220} stroke={16} tone={ringTone} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-1">
                <span className="text-4xl sm:text-5xl font-black tabular-nums text-white">
                  {challengeProgressPct.toFixed(1)}%
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  Challenge progress
                </span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-4 text-center lg:text-left">
              <div>
                <p className="text-sm text-slate-400">
                  Day {propChallenge.daysTraded} of {totalCalendarDays}
                </p>
                <p className="text-lg font-semibold text-white mt-1">
                  {daysRemaining} days remaining
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-surface-border bg-dark-300/60 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Pass probability</div>
                  <div className="text-2xl font-bold text-brand-400 mt-1">{passProbability}%</div>
                  <p className="text-xs text-slate-500 mt-1">Heuristic from progress &amp; drawdown headroom</p>
                </div>
                <div className="rounded-2xl border border-surface-border bg-dark-300/60 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Rule pressure</div>
                  <div
                    className={clsx(
                      'text-2xl font-bold mt-1',
                      drawdownPct >= 80 ? 'text-red-400' : drawdownPct >= 55 ? 'text-amber-400' : 'text-brand-400'
                    )}
                  >
                    {drawdownPct.toFixed(0)}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Drawdown budget used</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Account Size', value: `$${(propChallenge.accountSize / 1000).toFixed(0)}K`, sub: propChallenge.firm, icon: Shield, color: 'text-white' },
            { label: 'Current P&L', value: `+$${propChallenge.currentPnl.toLocaleString()}`, sub: `${((propChallenge.currentPnl / propChallenge.accountSize) * 100).toFixed(2)}%`, icon: TrendingUp, color: 'text-brand-400' },
            {
              label: 'Days Remaining',
              value: daysRemaining,
              sub: `${propChallenge.daysTraded} days traded`,
              icon: Calendar,
              color: isExpiringSoon ? 'text-red-400' : 'text-blue-400',
              pulse: isExpiringSoon,
            },
            { label: 'Total Trades', value: propChallenge.trades, sub: `${challengeWins}W / ${propChallenge.trades - challengeWins}L`, icon: BarChart3, color: 'text-white' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{s.label}</span>
                <s.icon className="w-4 h-4 text-slate-600" />
              </div>
              <div className={clsx('text-2xl font-bold', s.color, 'pulse' in s && s.pulse && 'animate-pulse')}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Profit Progress */}
          <div className="card p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-brand-400" />
              <h3 className="font-semibold text-white">Profit Target</h3>
              <Badge variant={profitPct >= 100 ? 'profit' : profitPct >= 50 ? 'info' : 'neutral'} size="xs">
                {profitPct.toFixed(1)}% of 8%
              </Badge>
            </div>

            <ProgressBar
              value={propChallenge.currentPnl}
              max={propChallenge.profitTarget}
              color="linear-gradient(90deg, #059669, #10b981)"
              label="Profit Progress (8% Target)"
              sublabel={`Started: ${format(new Date(propChallenge.startDate), 'MMM d')}`}
            />
          </div>

          {/* Drawdown */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">Drawdown Usage</h3>
              <Badge variant={drawdownPct >= 80 ? 'loss' : drawdownPct >= 50 ? 'warn' : 'profit'} size="xs">
                {drawdownPct.toFixed(1)}% used
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">Overall Drawdown (10% Max)</span>
                <span className="text-white font-bold">
                  ${propChallenge.currentDrawdown.toLocaleString()} / ${propChallenge.maxDrawdown.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-dark-300 rounded-full overflow-hidden border border-surface-border">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-700',
                    drawdownPct > 70 ? 'animate-pulse' : '',
                    drawdownPct > 80 ? 'bg-red-500' : drawdownPct > 60 ? 'bg-amber-500' : 'bg-brand-500'
                  )}
                  style={{ width: `${Math.min(drawdownPct, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">0% used</span>
                <span className={clsx('font-semibold', drawdownPct >= 80 ? 'text-amber-400' : 'text-slate-400')}>
                  {drawdownPct.toFixed(1)}% used
                </span>
              </div>
            </div>

            <ProgressBar
              value={propChallenge.dailyLoss}
              max={propChallenge.dailyDrawdown}
              color={dailyPct >= 80 ? '#ef4444' : '#3b82f6'}
              label="Daily Loss Limit (5% Max)"
              sublabel="Today"
            />
          </div>
        </div>

        {/* Status indicators */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Challenge Rules Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { rule: 'Minimum Trading Days', req: `${propChallenge.minTradingDays} days`, current: `${propChallenge.daysTraded} days`, ok: propChallenge.daysTraded >= propChallenge.minTradingDays },
              { rule: 'Profit Target', req: `$${propChallenge.profitTarget.toLocaleString()} (8%)`, current: `$${propChallenge.currentPnl.toLocaleString()}`, ok: propChallenge.currentPnl >= propChallenge.profitTarget },
              { rule: 'Max Drawdown', req: `Max $${propChallenge.maxDrawdown.toLocaleString()} (10%)`, current: `$${propChallenge.currentDrawdown.toLocaleString()} used`, ok: propChallenge.currentDrawdown < propChallenge.maxDrawdown },
              { rule: 'Daily Loss Limit', req: `Max $${propChallenge.dailyDrawdown.toLocaleString()} (5%)`, current: `$${propChallenge.dailyLoss.toLocaleString()} today`, ok: propChallenge.dailyLoss < propChallenge.dailyDrawdown },
            ].map(item => (
              <div key={item.rule} className={clsx(
                'flex items-center gap-3 p-4 rounded-xl border',
                item.ok ? 'bg-brand-500/5 border-brand-500/20' : 'bg-amber-500/5 border-amber-500/20'
              )}>
                {item.ok
                  ? <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  : <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{item.rule}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.req}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={clsx('text-sm font-semibold', item.ok ? 'text-brand-400' : 'text-amber-400')}>
                    {item.current}
                  </div>
                  <div className="text-xs text-slate-600">{item.ok ? 'On track' : 'Pending'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Challenge P&L Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title text-base">Challenge P&L Progress</h3>
              <p className="section-subtitle">Daily gains toward profit target</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Target</div>
              <div className="text-sm font-bold text-brand-400">$8,000</div>
            </div>
          </div>
          <PnLBarChart height={180} />
        </div>

        {/* Tips */}
        <div className="card p-5 bg-gradient-to-r from-brand-500/5 to-blue-500/5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-400" /> AI Challenge Tips
          </h3>
          <div className="space-y-2">
            {[
              `You need $${(propChallenge.profitTarget - propChallenge.currentPnl).toLocaleString()} more to hit the 8% profit target.`,
              `You have ${daysRemaining} days remaining. That's approximately $${((propChallenge.profitTarget - propChallenge.currentPnl) / daysRemaining).toFixed(0)}/day needed.`,
              `Your current drawdown usage is ${drawdownPct.toFixed(1)}%. Stay below 80% to avoid risk zone.`,
              `You've traded ${propChallenge.daysTraded} of the required ${propChallenge.minTradingDays} minimum trading days.`,
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-brand-400 font-bold flex-shrink-0 mt-0.5">→</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
