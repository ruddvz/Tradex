import { TxModeBadge, type TxMode } from './TxModeBadge';

/** @deprecated Prefer TxMode — kept for journal/report imports */
export type DataViewMode = 'demo' | 'live_journal' | 'paper' | 'backtest';

const VIEW_TO_TX: Record<DataViewMode, TxMode> = {
  demo: 'demo',
  live_journal: 'live_journal',
  paper: 'paper',
  backtest: 'backtest',
};

interface DataModeBadgeProps {
  mode: DataViewMode;
  showDescription?: boolean;
  className?: string;
}

export function DataModeBadge({ mode, showDescription, className }: DataModeBadgeProps) {
  return (
    <TxModeBadge mode={VIEW_TO_TX[mode]} showDescription={showDescription} className={className} />
  );
}

export function RealExecutionDisabledNotice({ className }: { className?: string }) {
  return (
    <p
      className={
        className ??
        'text-xs text-[var(--tx-text-3)] border border-[var(--tx-line-1)] rounded-[var(--tx-r-16)] px-3 py-2 bg-[var(--tx-surface-glass)]'
      }
    >
      Live execution disabled — journal, paper simulation, and backtests only.
    </p>
  );
}
