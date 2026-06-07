import { AlertTriangle } from 'lucide-react';
import { TxButton } from './TxButton';

interface TxErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  fallbackHint?: string;
}

export function TxErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  fallbackHint,
}: TxErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-[var(--tx-r-24)] border border-[var(--tx-loss)]/30 bg-[var(--tx-loss-soft)] px-5 py-6 text-center"
    >
      <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-[var(--tx-loss)]" aria-hidden />
      <p className="text-sm font-bold text-[var(--tx-text-1)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--tx-text-3)]">{description}</p>
      {fallbackHint && <p className="mt-2 text-xs text-[var(--tx-text-4)]">{fallbackHint}</p>}
      {onRetry && (
        <TxButton variant="secondary" size="md" className="mt-4" onClick={onRetry}>
          Try again
        </TxButton>
      )}
    </div>
  );
}
