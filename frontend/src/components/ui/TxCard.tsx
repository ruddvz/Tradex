import { clsx } from 'clsx';

type TxCardVariant =
  | 'default'
  | 'elevated'
  | 'inset'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info'
  | 'ai';

interface TxCardProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  variant?: TxCardVariant;
  padded?: boolean;
  interactive?: boolean;
  className?: string;
}

const VARIANT: Record<TxCardVariant, string> = {
  default: 'bg-[var(--tx-surface-1)] border-[var(--tx-line-1)]',
  elevated:
    'bg-[var(--tx-surface-2)] border-[var(--tx-line-2)] shadow-[var(--tx-shadow-card)] rounded-[var(--tx-r-24)]',
  inset: 'bg-[var(--tx-surface-inset)] border-[var(--tx-line-1)]',
  danger: 'bg-[var(--tx-loss-soft)] border-[var(--tx-loss)]/30',
  warning: 'bg-[var(--tx-warning-soft)] border-[var(--tx-warning)]/30',
  success: 'bg-[var(--tx-profit-soft)] border-[var(--tx-profit)]/30',
  info: 'bg-[var(--tx-info-soft)] border-[var(--tx-info)]/30',
  ai: 'bg-[var(--tx-ai-soft)] border-[var(--tx-ai)]/30',
};

export function TxCard({
  title,
  subtitle,
  action,
  children,
  variant = 'default',
  padded = true,
  interactive = false,
  className,
  ...rest
}: TxCardProps) {
  return (
    <section
      className={clsx(
        'rounded-[var(--tx-r-24)] border backdrop-blur-sm',
        VARIANT[variant],
        interactive && 'transition-transform active:scale-[0.99] cursor-pointer',
        className
      )}
      {...rest}
    >
      {(title || action) && (
        <div
          className={clsx(
            'flex items-start justify-between gap-3 border-b border-[var(--tx-line-1)]',
            padded && 'px-4 py-3'
          )}
        >
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-bold leading-5 text-[var(--tx-text-1)]">{title}</h2>
            )}
            {subtitle && <p className="mt-0.5 text-xs text-[var(--tx-text-3)]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={clsx(padded && 'p-4')}>{children}</div>
    </section>
  );
}
