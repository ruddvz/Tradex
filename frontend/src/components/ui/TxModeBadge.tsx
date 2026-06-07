import { clsx } from 'clsx';

export type TxMode =
  | 'demo'
  | 'live_journal'
  | 'paper'
  | 'backtest'
  | 'live_disabled'
  | 'risk_blocked'
  | 'synthetic';

const MODE_CONFIG: Record<
  TxMode,
  { label: string; description: string; variant: import('./TxBadge').TxBadgeVariant }
> = {
  demo: {
    label: 'Demo data',
    description: 'Sample trades only',
    variant: 'demo',
  },
  live_journal: {
    label: 'Live journal',
    description: 'Historical trades only',
    variant: 'liveJournal',
  },
  paper: {
    label: 'Paper mode',
    description: 'Simulated orders',
    variant: 'paper',
  },
  backtest: {
    label: 'Backtest',
    description: 'Historical simulation',
    variant: 'backtest',
  },
  live_disabled: {
    label: 'Live disabled',
    description: 'No broker execution',
    variant: 'liveDisabled',
  },
  risk_blocked: {
    label: 'Risk blocked',
    description: 'Orders stopped',
    variant: 'danger',
  },
  synthetic: {
    label: 'Synthetic data',
    description: 'Not market verified',
    variant: 'warning',
  },
};

interface TxModeBadgeProps {
  mode: TxMode;
  showDescription?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function TxModeBadge({
  mode,
  showDescription = false,
  size = 'sm',
  className,
}: TxModeBadgeProps) {
  const cfg = MODE_CONFIG[mode];
  return (
    <div className={clsx('inline-flex flex-col gap-0.5', className)}>
      <span
        className={clsx(
          'inline-flex w-fit items-center rounded-[var(--tx-r-pill)] border px-2.5 font-semibold',
          size === 'xs' && 'min-h-[24px] text-[10px]',
          size === 'sm' && 'min-h-[28px] text-[11px]',
          size === 'md' && 'min-h-[32px] text-xs',
          cfg.variant === 'demo' &&
            'bg-[var(--tx-warning-soft)] text-[var(--tx-warning)] border-[var(--tx-warning)]/35',
          cfg.variant === 'liveJournal' &&
            'bg-[var(--tx-profit-soft)] text-[var(--tx-profit)] border-[var(--tx-profit)]/35',
          cfg.variant === 'paper' &&
            'bg-[var(--tx-info-soft)] text-[var(--tx-info)] border-[var(--tx-info)]/35',
          cfg.variant === 'backtest' &&
            'bg-[var(--tx-ai-soft)] text-[var(--tx-ai)] border-[var(--tx-ai)]/35',
          cfg.variant === 'liveDisabled' &&
            'bg-[var(--tx-muted-soft)] text-[var(--tx-text-4)] border-[var(--tx-line-1)]',
          cfg.variant === 'danger' &&
            'bg-[var(--tx-loss-soft)] text-[var(--tx-loss)] border-[var(--tx-loss)]/35',
          cfg.variant === 'warning' &&
            'bg-[var(--tx-warning-soft)] text-[var(--tx-warning)] border-[var(--tx-warning)]/35'
        )}
      >
        {cfg.label}
      </span>
      {showDescription && (
        <span className="text-[11px] leading-snug text-[var(--tx-text-3)]">{cfg.description}</span>
      )}
    </div>
  );
}

/** @deprecated Use TxModeBadge */
export { TxModeBadge as DataModeBadgeAlias };
