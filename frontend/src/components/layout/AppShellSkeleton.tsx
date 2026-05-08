import { Skeleton, StatCardSkeleton } from '../ui/Skeleton';

/**
 * Content-area skeleton shown briefly on first paint (Plan0 §12.1).
 * Rendered inside `<main>` so desktop sidebar remains visible during boot.
 */
export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-dark-400 flex flex-col" aria-hidden>
      <div
        className="flex items-center gap-3 px-4 sm:px-6 border-b border-surface-border bg-dark-400/95 backdrop-blur-md shrink-0 pt-[env(safe-area-inset-top)]"
        style={{ minHeight: 'var(--header-height)' }}
      >
        <Skeleton className="h-7 w-36 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-48 rounded-lg hidden sm:block" />
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg hidden sm:flex" />
      </div>

      <div className="p-6 space-y-6 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2 min-h-[200px]">
            <Skeleton className="h-4 w-40 mb-4" />
            <Skeleton className="h-[160px] w-full rounded-xl" />
          </div>
          <div className="card p-5 min-h-[200px]">
            <Skeleton className="h-4 w-28 mb-4" />
            <Skeleton className="h-32 w-full rounded-full mx-auto max-w-[140px]" />
          </div>
        </div>
        <div className="card p-5">
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-[140px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
