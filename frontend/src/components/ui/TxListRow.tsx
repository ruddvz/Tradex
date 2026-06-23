import { clsx } from 'clsx';
import { ChevronRight } from 'lucide-react';

interface TxListRowProps {
  title: string;
  subtitle?: string;
  meta?: string;
  metaTone?: 'profit' | 'loss' | 'neutral' | 'warning';
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const META: Record<NonNullable<TxListRowProps['metaTone']>, string> = {
  profit: 'text-[var(--tx-profit)]',
  loss: 'text-[var(--tx-loss)]',
  neutral: 'text-[var(--tx-text-2)]',
  warning: 'text-[var(--tx-warning)]',
};

export function TxListRow({
  title,
  subtitle,
  meta,
  metaTone = 'neutral',
  leading,
  trailing,
  onClick,
  className,
}: TxListRowProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3 rounded-[var(--tx-r-14)] border border-[var(--tx-line-1)]',
        'bg-[var(--tx-surface-1)] px-3 py-3 min-h-[56px] text-left',
        onClick && 'active:scale-[0.99] transition-transform',
        className
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--tx-text-1)]">{title}</p>
        {subtitle && <p className="truncate text-xs text-[var(--tx-text-3)]">{subtitle}</p>}
      </div>
      {meta && (
        <span className={clsx('text-sm font-bold tabular-nums', META[metaTone])}>{meta}</span>
      )}
      {trailing ??
        (onClick ? <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tx-text-4)]" /> : null)}
    </Comp>
  );
}
