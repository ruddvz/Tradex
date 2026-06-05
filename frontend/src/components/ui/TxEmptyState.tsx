import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { TxButton } from './TxButton';

interface TxEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function TxEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: TxEmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-[var(--tx-radius-md)] border border-dashed border-[var(--tx-line-2)]',
        'bg-[var(--tx-surface-1)] px-6 py-10 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tx-surface-2)]">
          <Icon className="h-6 w-6 text-[var(--tx-text-3)]" aria-hidden />
        </div>
      )}
      <h3 className="text-base font-bold text-[var(--tx-text-1)]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--tx-text-3)]">{description}</p>
      {actionLabel && onAction && (
        <TxButton className="mt-4" variant="primary" onClick={onAction}>
          {actionLabel}
        </TxButton>
      )}
    </div>
  );
}
