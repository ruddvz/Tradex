import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

type TxIconButtonVariant = 'glass' | 'ghost' | 'danger' | 'warning' | 'success' | 'ai';
type TxIconButtonSize = 'sm' | 'md' | 'lg';

export interface TxIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: LucideIcon;
  variant?: TxIconButtonVariant;
  size?: TxIconButtonSize;
  active?: boolean;
}

const VARIANT: Record<TxIconButtonVariant, string> = {
  glass:
    'bg-[var(--tx-surface-glass)] border-[var(--tx-line-2)] text-[var(--tx-text-2)] hover:bg-[var(--tx-surface-2)]',
  ghost: 'bg-transparent border-transparent text-[var(--tx-text-3)] hover:bg-[var(--tx-surface-1)]',
  danger:
    'bg-[var(--tx-loss-soft)] border-[var(--tx-loss)]/35 text-[var(--tx-loss)] hover:brightness-110',
  warning: 'bg-[var(--tx-warning-soft)] border-[var(--tx-warning)]/35 text-[var(--tx-warning)]',
  success: 'bg-[var(--tx-profit-soft)] border-[var(--tx-profit)]/35 text-[var(--tx-profit)]',
  ai: 'bg-[var(--tx-ai-soft)] border-[var(--tx-ai)]/35 text-[var(--tx-ai)]',
};

const SIZE: Record<TxIconButtonSize, { box: string; icon: string }> = {
  sm: { box: 'h-9 w-9', icon: 'h-4 w-4' },
  md: { box: 'h-11 w-11', icon: 'h-[18px] w-[18px]' },
  lg: { box: 'h-[52px] w-[52px]', icon: 'h-5 w-5' },
};

export function TxIconButton({
  label,
  icon: Icon,
  variant = 'glass',
  size = 'md',
  active,
  className,
  type = 'button',
  ...props
}: TxIconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-[var(--tx-r-14)] border',
        'transition-all duration-[var(--tx-motion-fast)] active:scale-[0.985]',
        VARIANT[variant],
        SIZE[size].box,
        active && 'ring-2 ring-[var(--tx-line-focus)]',
        className
      )}
      {...props}
    >
      <Icon className={SIZE[size].icon} aria-hidden />
    </button>
  );
}
