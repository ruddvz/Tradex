import { clsx } from 'clsx';

interface TxPageProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  density?: 'standard' | 'compact' | 'dashboard';
  maxWidth?: 'page' | 'wide' | 'full';
}

/** Page wrapper — safe padding, bottom nav clearance, max-width on desktop. */
const MAX_W = {
  page: 'max-w-[var(--tx-page-max)]',
  wide: 'max-w-[1600px]',
  full: 'max-w-none',
} as const;

export function TxPage({
  title,
  subtitle,
  eyebrow,
  action,
  children,
  className,
  density = 'standard',
  maxWidth = 'page',
}: TxPageProps) {
  return (
    <div
      className={clsx(
        'mx-auto w-full tx-page-clear-bottom',
        MAX_W[maxWidth],
        density === 'compact' && 'px-3 py-4 space-y-4',
        density === 'standard' &&
          'px-[var(--tx-page-x)] py-5 space-y-6 md:px-[var(--tx-page-x-desktop)] md:py-6 md:space-y-7',
        density === 'dashboard' &&
          'px-[var(--tx-page-x)] py-4 space-y-4 md:px-[var(--tx-page-x-desktop)] md:pb-12',
        className
      )}
    >
      {(title || subtitle || eyebrow) && (
        <header className="hidden lg:flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--tx-text-4)]">
                {eyebrow}
              </p>
            )}
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-[var(--tx-text-1)]">{title}</h1>
            )}
            {subtitle && <p className="mt-1 text-sm text-[var(--tx-text-3)]">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </div>
  );
}
