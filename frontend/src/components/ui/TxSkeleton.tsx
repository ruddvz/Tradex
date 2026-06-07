import { clsx } from 'clsx';

export function TxSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-[var(--tx-r-12)] bg-gradient-to-r from-[var(--tx-surface-1)] via-[var(--tx-surface-2)] to-[var(--tx-surface-1)]',
        className
      )}
      aria-hidden
    />
  );
}
