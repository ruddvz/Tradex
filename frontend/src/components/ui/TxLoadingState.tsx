import { Loader2 } from 'lucide-react';
import { TxSkeleton } from './TxSkeleton';

interface TxLoadingStateProps {
  label?: string;
  variant?: 'inline' | 'card' | 'page';
}

export function TxLoadingState({ label = 'Loading…', variant = 'card' }: TxLoadingStateProps) {
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-[var(--tx-text-3)]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {label}
      </span>
    );
  }

  if (variant === 'page') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--tx-profit)]" aria-hidden />
        <p className="text-sm text-[var(--tx-text-3)]">{label}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[var(--tx-r-24)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-1)] p-4">
      <p className="text-sm text-[var(--tx-text-3)]">{label}</p>
      <TxSkeleton className="h-4 w-3/4" />
      <TxSkeleton className="h-4 w-1/2" />
      <TxSkeleton className="h-24 w-full rounded-[var(--tx-r-16)]" />
    </div>
  );
}
