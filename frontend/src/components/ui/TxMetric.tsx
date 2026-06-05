import { clsx } from 'clsx';

interface TxMetricProps {
  label: string;
  value: string;
  subline?: string;
  tone?: 'neutral' | 'profit' | 'loss' | 'warning';
  className?: string;
}

const TONE: Record<NonNullable<TxMetricProps['tone']>, string> = {
  neutral: 'text-[var(--tx-text-1)]',
  profit: 'text-[var(--tx-profit)]',
  loss: 'text-[var(--tx-loss)]',
  warning: 'text-[var(--tx-warning)]',
};

export function TxMetric({ label, value, subline, tone = 'neutral', className }: TxMetricProps) {
  return (
    <div className={clsx('min-w-0', className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--tx-text-4)]">
        {label}
      </p>
      <p className={clsx('mt-0.5 text-2xl font-bold tabular-nums tracking-tight', TONE[tone])}>
        {value}
      </p>
      {subline && <p className="mt-0.5 text-xs text-[var(--tx-text-3)]">{subline}</p>}
    </div>
  );
}
