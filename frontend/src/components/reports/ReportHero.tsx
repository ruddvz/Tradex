import { TxCard } from '../ui/TxCard';
import { TxMetric } from '../ui/TxMetric';
import { TxModeBadge } from '../ui/TxModeBadge';

interface ReportHeroProps {
  periodLabel: string;
  netPnl: string;
  profitFactor: string;
  maxDrawdown: string;
  sampleSize: number;
  mode: 'demo' | 'live_journal' | 'paper' | 'backtest';
  lowSampleWarning?: boolean;
}

export function ReportHero({
  periodLabel,
  netPnl,
  profitFactor,
  maxDrawdown,
  sampleSize,
  mode,
  lowSampleWarning,
}: ReportHeroProps) {
  return (
    <TxCard variant="elevated" title="Report summary" subtitle={periodLabel}>
      <div className="mb-4">
        <TxModeBadge mode={mode} showDescription />
      </div>
      {lowSampleWarning && (
        <p className="mb-4 rounded-[var(--tx-r-16)] border border-[var(--tx-warning)]/35 bg-[var(--tx-warning-soft)] px-3 py-2 text-sm text-[var(--tx-warning)]">
          Only {sampleSize} trades in this period. Treat stats as directional, not proven.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <TxMetric label="Net P&L" value={netPnl} tone={netPnl.startsWith('+') ? 'profit' : 'loss'} />
        <TxMetric label="Profit factor" value={profitFactor} />
        <TxMetric label="Max drawdown" value={maxDrawdown} tone="warning" />
        <TxMetric label="Sample size" value={String(sampleSize)} subline="trades in period" />
      </div>
    </TxCard>
  );
}
