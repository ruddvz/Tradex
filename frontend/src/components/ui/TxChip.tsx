import { clsx } from 'clsx';

type TxChipVariant = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'ai';

interface TxChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  count?: number;
  variant?: TxChipVariant;
}

const TINT: Record<TxChipVariant, string> = {
  neutral: 'bg-[var(--tx-surface-glass)] text-[var(--tx-text-2)] border-[var(--tx-line-1)]',
  success: 'bg-[var(--tx-profit-soft)] text-[var(--tx-profit)] border-[var(--tx-profit)]/35',
  danger: 'bg-[var(--tx-loss-soft)] text-[var(--tx-loss)] border-[var(--tx-loss)]/35',
  warning: 'bg-[var(--tx-warning-soft)] text-[var(--tx-warning)] border-[var(--tx-warning)]/35',
  info: 'bg-[var(--tx-info-soft)] text-[var(--tx-info)] border-[var(--tx-info)]/35',
  ai: 'bg-[var(--tx-ai-soft)] text-[var(--tx-ai)] border-[var(--tx-ai)]/35',
};

export function TxChip({
  children,
  selected,
  count,
  variant = 'neutral',
  className,
  type = 'button',
  ...props
}: TxChipProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex min-h-[32px] shrink-0 items-center justify-center gap-1 rounded-[var(--tx-r-pill)] border px-3',
        'text-xs font-semibold transition-all duration-[var(--tx-motion-fast)] active:scale-[0.98]',
        selected ? TINT[variant] : TINT.neutral,
        className
      )}
      {...props}
    >
      {children}
      {count != null && (
        <span className="rounded-[var(--tx-r-pill)] bg-black/20 px-1.5 text-[10px]">{count}</span>
      )}
    </button>
  );
}
