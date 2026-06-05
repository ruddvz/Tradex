import { clsx } from 'clsx';

interface TxPageProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  density?: 'standard' | 'compact';
}

/** Page wrapper — safe padding, bottom nav clearance, max-width on desktop. */
export function TxPage({
  title,
  subtitle,
  children,
  className,
  density = 'standard',
}: TxPageProps) {
  return (
    <div
      className={clsx(
        'mx-auto w-full max-w-[1400px]',
        density === 'compact' ? 'px-3 py-4 space-y-4' : 'px-[var(--tx-page-x)] py-5 space-y-6',
        'md:px-6 md:py-6 md:space-y-7',
        className
      )}
    >
      {(title || subtitle) && (
        <header className="hidden lg:block">
          {title && (
            <h1 className="text-2xl font-bold tracking-tight text-[var(--tx-text-1)]">{title}</h1>
          )}
          {subtitle && <p className="mt-1 text-sm text-[var(--tx-text-3)]">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  );
}
