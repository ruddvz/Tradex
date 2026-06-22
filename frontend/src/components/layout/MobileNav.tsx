import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Wallet, ShieldAlert, Grid3X3 } from 'lucide-react';
import { clsx } from 'clsx';

/** Five-tab iPhone-first navigation — Today, Journal, Bot, Risk, More */
const mobileNavItems = [
  { path: '/', label: 'Today', icon: LayoutDashboard },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/paper-trading', label: 'Bot', icon: Wallet },
  { path: '/risk', label: 'Risk', icon: ShieldAlert },
  { path: '/more', label: 'More', icon: Grid3X3 },
] as const;

export function MobileNav() {
  const location = useLocation();

  return (
    <nav
      role="navigation"
      aria-label="Primary mobile"
      className={clsx(
        'fixed z-50 md:hidden',
        'left-3 right-3',
        'bottom-[max(10px,env(safe-area-inset-bottom))]',
        'min-h-[64px] rounded-[var(--tx-r-32)]',
        'flex items-stretch justify-between gap-0.5 px-1.5 pt-2',
        'bg-[var(--tx-surface-1)] backdrop-blur-[24px]',
        'border border-[var(--tx-line-2)] shadow-[var(--tx-shadow-float)]'
      )}
      style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
    >
      {mobileNavItems.map(({ path, label, icon: Icon }) => {
        const isActive =
          path === '/'
            ? location.pathname === '/'
            : path === '/more'
              ? location.pathname === '/more' ||
                [
                  '/playbooks',
                  '/reports',
                  '/settings',
                  '/backtests',
                  '/propfirm',
                  '/notebook',
                  '/calculator',
                  '/live-readiness',
                  '/action-center',
                  '/reports/compare',
                  '/performance-compare',
                ].some((p) => location.pathname.startsWith(p))
              : path === '/paper-trading'
                ? location.pathname.startsWith('/paper') ||
                  location.pathname.startsWith('/paper-trading')
                : location.pathname.startsWith(path);
        const isRisk = path === '/risk';
        return (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            aria-current={isActive ? 'page' : undefined}
            className={clsx(
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[var(--tx-radius-sm)]',
              'min-h-[52px] min-w-[48px] px-0.5 py-1.5 transition-colors duration-[var(--tx-motion-fast)]',
              'active:scale-[0.97]',
              isActive && !isRisk && 'bg-[var(--tx-brand-soft)] text-[var(--tx-brand)]',
              isActive && isRisk && 'bg-[var(--tx-warning-soft)] text-[var(--tx-warning)]',
              !isActive && 'text-[var(--tx-text-4)]'
            )}
          >
            <Icon className="w-[22px] h-[22px] shrink-0" strokeWidth={isActive ? 2.25 : 2} />
            <span className="text-[10px] font-semibold leading-none tracking-tight">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
