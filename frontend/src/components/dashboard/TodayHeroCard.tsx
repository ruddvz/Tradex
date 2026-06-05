import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { TxMetricCard } from '../ui/TxMetricCard';
import { TxSegmentedControl } from '../ui/TxSegmentedControl';
import { TxModePill } from '../status/TxModePill';
import { resolveTxMode } from '../../lib/resolveTxMode';
import { useStore } from '../../store/useStore';
import { formatPnl } from '../../lib/formatters';

const RANGES = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: 'all', label: 'All' },
];

interface TodayHeroCardProps {
  className?: string;
}

export function TodayHeroCard({ className }: TodayHeroCardProps) {
  const navigate = useNavigate();
  const { metrics, dataMode, paperModeActive, selectedDateRange, setDateRange } = useStore();
  const mode = resolveTxMode({ dataMode, paperModeActive, liveReadinessPassed: false });
  const pnlStatus = metrics.totalPnl >= 0 ? 'profit' : 'loss';

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TxModePill mode={mode} />
        <TxSegmentedControl
          items={RANGES}
          value={selectedDateRange}
          onChange={(id) => setDateRange(id as '7d' | '30d' | '90d' | 'all')}
          className="max-w-full overflow-x-auto"
        />
      </div>
      <TxMetricCard
        hero
        label="Today P&L"
        value={formatPnl(metrics.totalPnl).replace('+', '')}
        prefix={metrics.totalPnl >= 0 ? '+' : ''}
        status={pnlStatus}
        supportingText={`${metrics.totalTrades} trades · ${metrics.winRate}% win rate`}
      />
      <button
        type="button"
        onClick={() => navigate('/reports')}
        className="text-xs font-semibold text-[var(--tx-info)]"
      >
        View full report →
      </button>
    </div>
  );
}
