import { clsx } from 'clsx';

export type DataSource = 'demo' | 'manual' | 'mt5' | 'paper' | 'backtest' | 'mixed' | 'live';

const SOURCE_CONFIG: Record<DataSource, { label: string; className: string }> = {
  demo: { label: 'Demo', className: 'border-amber-500/30 text-amber-200 bg-amber-500/8' },
  manual: { label: 'Manual', className: 'border-surface-border text-text-muted bg-surface/50' },
  mt5: { label: 'MT5', className: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10' },
  paper: { label: 'Paper', className: 'border-analytics/35 text-analytics bg-analytics/10' },
  backtest: {
    label: 'Backtest',
    className: 'border-purple-500/30 text-purple-200 bg-purple-500/10',
  },
  mixed: { label: 'Mixed', className: 'border-surface-border text-text-secondary bg-surface/40' },
  live: { label: 'Live', className: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10' },
};

interface DataSourceBadgeProps {
  source: DataSource;
  className?: string;
}

export function DataSourceBadge({ source, className }: DataSourceBadgeProps) {
  const cfg = SOURCE_CONFIG[source] ?? SOURCE_CONFIG.manual;
  return (
    <span
      className={clsx(
        'inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide border',
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
