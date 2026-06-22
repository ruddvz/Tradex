import { clsx } from 'clsx';

type TxButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'warning'
  | 'success'
  | 'ai'
  | 'disabledLive';

type TxButtonSize = 'sm' | 'md' | 'lg';

interface TxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TxButtonVariant;
  size?: TxButtonSize;
  fullWidth?: boolean;
}

const VARIANT: Record<TxButtonVariant, string> = {
  primary: 'bg-[var(--tx-brand)] text-white hover:brightness-110',
  secondary:
    'bg-[var(--tx-surface-2)] text-[var(--tx-text-1)] border border-[var(--tx-line-2)] hover:bg-[var(--tx-surface-3)]',
  ghost: 'bg-transparent text-[var(--tx-text-2)] hover:bg-[var(--tx-surface-1)]',
  danger: 'bg-[var(--tx-loss)]/15 text-[var(--tx-loss)] border border-[var(--tx-loss)]/35',
  warning:
    'bg-[var(--tx-warning-soft)] text-[var(--tx-warning)] border border-[var(--tx-warning)]/35',
  success: 'bg-[var(--tx-profit-soft)] text-[var(--tx-profit)] border border-[var(--tx-profit)]/35',
  ai: 'bg-[var(--tx-ai-soft)] text-[var(--tx-ai)] border border-[var(--tx-ai)]/35',
  disabledLive:
    'bg-[var(--tx-surface-2)] text-[var(--tx-text-4)] border border-[var(--tx-line-1)] cursor-not-allowed opacity-70',
};

const SIZE: Record<TxButtonSize, string> = {
  sm: 'min-h-[36px] px-3 text-xs',
  md: 'min-h-[44px] px-4 text-sm',
  lg: 'min-h-[52px] px-5 text-base',
};

export function TxButton({
  variant = 'secondary',
  size = 'md',
  fullWidth,
  className,
  disabled,
  type = 'button',
  ...props
}: TxButtonProps) {
  const isDisabledLive = variant === 'disabledLive';
  return (
    <button
      type={type}
      disabled={disabled || isDisabledLive}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-[var(--tx-radius-sm)] font-semibold',
        'transition-all duration-[var(--tx-motion-fast)] active:scale-[0.98]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tx-brand)]',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
}
