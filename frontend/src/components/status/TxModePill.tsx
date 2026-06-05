import { clsx } from 'clsx';

export type TxMode =
  | 'demo'
  | 'paper'
  | 'mt5'
  | 'liveLocked'
  | 'liveReady'
  | 'liveBlocked';

const MODE_CONFIG: Record<TxMode, { label: string; className: string }> = {
  demo: {
    label: 'Demo data',
    className: 'bg-[var(--tx-warning-soft)] text-[var(--tx-warning)] border-[var(--tx-warning)]/35',
  },
  paper: {
    label: 'Paper mode',
    className: 'bg-[var(--tx-info-soft)] text-[var(--tx-info)] border-[var(--tx-info)]/35',
  },
  mt5: {
    label: 'MT5 sync',
    className: 'bg-[var(--tx-profit-soft)] text-[var(--tx-profit)] border-[var(--tx-profit)]/35',
  },
  liveLocked: {
    label: 'Live locked',
    className: 'bg-[var(--tx-surface-2)] text-[var(--tx-text-3)] border-[var(--tx-line-2)]',
  },
  liveReady: {
    label: 'Live ready',
    className: 'bg-[var(--tx-profit-soft)] text-[var(--tx-profit)] border-[var(--tx-profit)]/35',
  },
  liveBlocked: {
    label: 'Live blocked',
    className: 'bg-[var(--tx-loss-soft)] text-[var(--tx-loss)] border-[var(--tx-loss)]/35',
  },
};

interface TxModePillProps {
  mode: TxMode;
  className?: string;
}

export function TxModePill({ mode, className }: TxModePillProps) {
  const cfg = MODE_CONFIG[mode];
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-[var(--tx-radius-pill)] border px-2.5 py-1',
        'text-[10px] font-bold uppercase tracking-wide',
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
