/** Full-route lazy-load fallback — keeps shell chrome without layout shift. */
export function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center px-4">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-brand-500/25 border-t-brand-400"
        role="status"
        aria-label="Loading page"
      />
    </div>
  );
}
