import { clsx } from 'clsx';
import { Maximize2 } from 'lucide-react';
import { TxButton } from './TxButton';

interface TxChartCardProps {
  title: string;
  subtitle?: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  empty?: string;
  onExpand?: () => void;
  className?: string;
}

export function TxChartCard({
  title,
  subtitle,
  legend,
  children,
  loading,
  error,
  empty,
  onExpand,
  className,
}: TxChartCardProps) {
  return (
    <section
      className={clsx(
        'rounded-[var(--tx-r-18)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-1)]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--tx-line-1)] px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-[var(--tx-text-1)]">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--tx-text-3)]">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {legend}
          {onExpand && (
            <TxButton variant="ghost" size="sm" aria-label={`Expand ${title}`} onClick={onExpand}>
              <Maximize2 className="h-4 w-4" />
            </TxButton>
          )}
        </div>
      </div>
      <div className="p-3 min-h-[180px]">
        {loading && (
          <div className="h-[160px] animate-pulse rounded-[var(--tx-r-14)] bg-[var(--tx-surface-2)]" />
        )}
        {!loading && error && (
          <p className="py-8 text-center text-sm text-[var(--tx-loss)]">{error}</p>
        )}
        {!loading && !error && empty && (
          <p className="py-8 text-center text-sm text-[var(--tx-text-3)]">{empty}</p>
        )}
        {!loading && !error && !empty && children}
      </div>
    </section>
  );
}
