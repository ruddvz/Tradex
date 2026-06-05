import { clsx } from 'clsx';

/** Canonical view mode — how data on screen should be interpreted. */
export type DataViewMode = 'demo' | 'live_journal' | 'paper' | 'backtest';

const MODE_CONFIG: Record<
  DataViewMode,
  { label: string; description: string; className: string }
> = {
  demo: {
    label: 'Demo data',
    description: 'Sample trades only. Not your account.',
    className: 'border-amber-500/40 bg-amber-500/12 text-amber-200',
  },
  live_journal: {
    label: 'Live journal',
    description: 'Imported historical trades. No orders can be placed.',
    className: 'border-emerald-500/40 bg-emerald-500/12 text-emerald-300',
  },
  paper: {
    label: 'Paper mode',
    description: 'Simulated trading. No real money.',
    className: 'border-analytics/45 bg-analytics/12 text-analytics',
  },
  backtest: {
    label: 'Backtest result',
    description: 'Historical simulation. May not match live execution.',
    className: 'border-purple-500/40 bg-purple-500/12 text-purple-200',
  },
};

interface DataModeBadgeProps {
  mode: DataViewMode;
  showDescription?: boolean;
  className?: string;
}

export function DataModeBadge({ mode, showDescription = false, className }: DataModeBadgeProps) {
  const cfg = MODE_CONFIG[mode];
  return (
    <div className={clsx('inline-flex flex-col gap-0.5', className)}>
      <span
        className={clsx(
          'inline-flex w-fit px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border',
          cfg.className
        )}
        title={cfg.description}
      >
        {cfg.label}
      </span>
      {showDescription && (
        <span className="text-[11px] text-text-muted leading-snug">{cfg.description}</span>
      )}
    </div>
  );
}

export function RealExecutionDisabledNotice({ className }: { className?: string }) {
  return (
    <p
      className={clsx(
        'text-xs text-text-muted border border-surface-border rounded-lg px-3 py-2 bg-surface/40',
        className
      )}
    >
      Real execution disabled — journal, paper simulation, and backtests only.
    </p>
  );
}
