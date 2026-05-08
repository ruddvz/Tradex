import { clsx } from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'bg-surface-border rounded-lg animate-pulse',
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5 min-h-[116px]">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
