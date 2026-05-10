import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { EquityCurve } from '../charts/EquityCurve';
import { useStore } from '../../store/useStore';

const ranges = [
  { key: '7d' as const, label: '7D' },
  { key: '30d' as const, label: '30D' },
  { key: '90d' as const, label: '90D' },
  { key: 'all' as const, label: 'All' },
];

interface HeroMetricCardProps {
  label?: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  /** Used for semantic coloring of the hero number */
  pnlNonNegative: boolean;
  sparklineHeight?: number;
}

export function HeroMetricCard({
  label = 'Total P&L',
  value,
  trend,
  trendLabel = 'vs last period',
  pnlNonNegative,
  sparklineHeight = 128,
}: HeroMetricCardProps) {
  const { selectedDateRange, setDateRange } = useStore();
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-[22px] border border-[rgba(126,146,185,0.2)] p-5 shadow-card',
        'bg-gradient-to-b from-[rgba(24,34,58,0.94)] to-[rgba(15,23,42,0.96)]',
        'min-h-[200px] max-h-[280px] flex flex-col'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
          <p
            className={clsx(
              'text-4xl sm:text-5xl font-extrabold tracking-tight mt-1 tabular-nums',
              pnlNonNegative ? 'text-success' : 'text-danger'
            )}
          >
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={clsx(
                  'text-sm font-semibold inline-flex items-center gap-1',
                  isPositiveTrend ? 'text-success' : 'text-danger'
                )}
              >
                {isPositiveTrend ? <TrendingUp className="w-4 h-4 shrink-0" /> : <TrendingDown className="w-4 h-4 shrink-0" />}
                <span>
                  {isPositiveTrend ? '+' : ''}
                  {trend}%{' '}
                  <span className="text-text-muted font-normal">{trendLabel}</span>
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          {ranges.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setDateRange(r.key)}
              className={clsx('chip', selectedDateRange === r.key && 'chip-active')}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-[100px] mt-4 -mx-1">
        <EquityCurve height={sparklineHeight} />
      </div>
    </div>
  );
}
