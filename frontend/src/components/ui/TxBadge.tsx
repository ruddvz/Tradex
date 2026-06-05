import { clsx } from 'clsx';

export type TxBadgeVariant =
  | 'neutral'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'ai'
  | 'demo'
  | 'paper'
  | 'backtest'
  | 'liveJournal'
  | 'liveDisabled';

type TxBadgeSize = 'xs' | 'sm' | 'md';

const VARIANT: Record<TxBadgeVariant, string> = {
  neutral: 'bg-[var(--tx-muted-soft)] text-[var(--tx-text-2)] border-[var(--tx-line-2)]',
  success: 'bg-[var(--tx-profit-soft)] text-[var(--tx-profit)] border-[var(--tx-profit)]/35',
  danger: 'bg-[var(--tx-loss-soft)] text-[var(--tx-loss)] border-[var(--tx-loss)]/35',
  warning: 'bg-[var(--tx-warning-soft)] text-[var(--tx-warning)] border-[var(--tx-warning)]/35',
  info: 'bg-[var(--tx-info-soft)] text-[var(--tx-info)] border-[var(--tx-info)]/35',
  ai: 'bg-[var(--tx-ai-soft)] text-[var(--tx-ai)] border-[var(--tx-ai)]/35',
  demo: 'bg-[var(--tx-warning-soft)] text-[var(--tx-warning)] border-[var(--tx-warning)]/35',
  paper: 'bg-[var(--tx-info-soft)] text-[var(--tx-info)] border-[var(--tx-info)]/35',
  backtest: 'bg-[var(--tx-ai-soft)] text-[var(--tx-ai)] border-[var(--tx-ai)]/35',
  liveJournal: 'bg-[var(--tx-profit-soft)] text-[var(--tx-profit)] border-[var(--tx-profit)]/35',
  liveDisabled: 'bg-[var(--tx-muted-soft)] text-[var(--tx-text-4)] border-[var(--tx-line-1)]',
};

const SIZE: Record<TxBadgeSize, string> = {
  xs: 'min-h-[24px] px-2 py-0.5 text-[10px]',
  sm: 'min-h-[28px] px-2.5 py-0.5 text-[11px]',
  md: 'min-h-[32px] px-3 py-1 text-xs',
};

interface TxBadgeProps {
  children: React.ReactNode;
  variant?: TxBadgeVariant;
  size?: TxBadgeSize;
  uppercase?: boolean;
  className?: string;
}

export function TxBadge({
  children,
  variant = 'neutral',
  size = 'sm',
  uppercase = false,
  className,
}: TxBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-[var(--tx-r-pill)] border font-semibold',
        VARIANT[variant],
        SIZE[size],
        uppercase && 'uppercase tracking-wide',
        className
      )}
    >
      {children}
    </span>
  );
}
