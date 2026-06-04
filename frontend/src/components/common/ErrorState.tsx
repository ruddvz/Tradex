import { AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-loss/30 bg-loss/5 px-5 py-6 flex flex-col items-center text-center gap-2',
        className
      )}
      role="alert"
    >
      <AlertTriangle className="w-8 h-8 text-loss/80" />
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="text-sm text-text-muted max-w-md">{message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary mt-2 text-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
