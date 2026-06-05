import { clsx } from 'clsx';

interface BottomActionBarProps {
  children: React.ReactNode;
  className?: string;
}

/** Sticky bottom action row above tab bar on mobile. */
export function BottomActionBar({ children, className }: BottomActionBarProps) {
  return (
    <div
      className={clsx(
        'fixed z-40 left-0 right-0 md:hidden',
        'border-t border-[var(--tx-line-1)] bg-[var(--tx-bg-1)]/95 backdrop-blur-xl',
        'px-[var(--tx-page-x)] py-3',
        className
      )}
      style={{ bottom: 'calc(var(--tx-tabbar-h) - env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  );
}
