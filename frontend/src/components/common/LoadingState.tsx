import { clsx } from 'clsx';

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = 'Loading…', className }: LoadingStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3 py-12 text-text-muted',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 rounded-full border-2 border-analytics/30 border-t-analytics animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
