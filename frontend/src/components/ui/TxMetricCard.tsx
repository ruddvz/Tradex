import { clsx } from 'clsx';
import { TrendingDown, TrendingUp } from 'lucide-react';

type TxMetricStatus = 'profit' | 'loss' | 'neutral' | 'warning';

interface TxMetricCardProps {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  delta?: number;
  status?: TxMetricStatus;
  supportingText?: string;
  sparkline?: React.ReactNode;
  className?: string;
  hero?: boolean;
}

const STATUS_COLOR: Record<TxMetricStatus, string> = {
  profit: 'text-[var(--tx-profit)]',
  loss: 'text-[var(--tx-loss)]',
  neutral: 'text-[var(--tx-text-1)]',
  warning: 'text-[var(--tx-warning)]',
};

export function TxMetricCard({
  label,
  value,
  prefix,
  suffix,
  delta,
  status = 'neutral',
  supportingText,
  sparkline,
  className,
  hero = false,
}: TxMetricCardProps) {
  return (
    <div
      className={clsx(
        'rounded-[var(--tx-r-18)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-1)] p-4',
        hero && 'col-span-full p-5',
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--tx-text-3)]">
        {label}
      </p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p
          className={clsx(
            'font-bold tracking-tight',
            hero ? 'text-[40px] leading-[44px]' : 'text-2xl',
            STATUS_COLOR[status]
          )}
        >
          {prefix}
          {value}
          {suffix}
        </p>
        {sparkline}
      </div>
      {(delta !== undefined || supportingText) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {delta !== undefined && (
            <span
              className={clsx(
                'inline-flex items-center gap-0.5 font-semibold',
                delta >= 0 ? 'text-[var(--tx-profit)]' : 'text-[var(--tx-loss)]'
              )}
            >
              {delta >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" aria-hidden />
              )}
              {delta >= 0 ? '+' : ''}
              {delta.toFixed(1)}%
            </span>
          )}
          {supportingText && <span className="text-[var(--tx-text-3)]">{supportingText}</span>}
        </div>
      )}
    </div>
  );
}
