import { clsx } from 'clsx';

export type AppMode =
  | 'demo'
  | 'live_journal'
  | 'paper'
  | 'backtest'
  | 'live_disabled'
  | 'live_enabled';

const MODE_CONFIG: Record<AppMode, { label: string; className: string; title: string }> = {
  demo: {
    label: 'Demo data',
    className: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
    title: 'Sample trades only — sign in or connect MT5 for real journal data.',
  },
  live_journal: {
    label: 'Live journal',
    className: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    title: 'Trades and metrics load from your API account. No auto-execution.',
  },
  paper: {
    label: 'Paper mode',
    className: 'border-analytics/45 bg-analytics/12 text-analytics',
    title: 'Simulated orders and fills — results may differ from live trading.',
  },
  backtest: {
    label: 'Backtest',
    className: 'border-purple-500/40 bg-purple-500/12 text-purple-200',
    title: 'Historical strategy simulation — not live performance.',
  },
  live_disabled: {
    label: 'Live disabled',
    className: 'border-surface-border bg-surface/60 text-text-muted',
    title: 'Journal, analytics, paper, and backtests only. Live execution is off.',
  },
  live_enabled: {
    label: 'Live enabled',
    className: 'border-loss/50 bg-loss/15 text-loss',
    title: 'High risk — live automation is enabled (not recommended until safeguards pass).',
  },
};

interface ModeBadgeProps {
  mode: AppMode;
  className?: string;
}

export function ModeBadge({ mode, className }: ModeBadgeProps) {
  const cfg = MODE_CONFIG[mode];
  return (
    <span
      className={clsx(
        'shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border',
        cfg.className,
        className
      )}
      title={cfg.title}
    >
      {cfg.label}
    </span>
  );
}
