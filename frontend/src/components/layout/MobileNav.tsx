import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  BarChart3,
  Wallet,
} from 'lucide-react';
import { clsx } from 'clsx';

/** Five primary destinations — sized for iPhone home indicator and 44pt touch targets. */
const mobileNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/paper-trading', label: 'Paper', icon: Wallet },
  { path: '/playbooks', label: 'AI', icon: Brain },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
] as const;

export function MobileNav() {
  const location = useLocation();

  return (
    <nav
      role="navigation"
      aria-label="Primary mobile"
      className={clsx(
        'fixed z-50 md:hidden',
        'left-[max(0.5rem,env(safe-area-inset-left))]',
        'right-[max(0.5rem,env(safe-area-inset-right))]',
        'bottom-[max(0.5rem,env(safe-area-inset-bottom))]',
        'min-h-[64px] rounded-[22px]',
        'flex items-stretch justify-between gap-0.5 px-1.5 pt-2',
        'bg-[rgba(12,18,32,0.88)] backdrop-blur-[24px]',
        'border border-[rgba(126,146,185,0.2)]',
        'shadow-[0_16px_48px_rgba(0,0,0,0.45)]',
        'supports-[backdrop-filter]:bg-[rgba(12,18,32,0.78)]'
      )}
      style={{
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      }}
    >
      {mobileNavItems.map(({ path, label, icon: Icon }) => {
        const isActive =
          path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
        const isAi = path === '/playbooks';
        return (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            aria-current={isActive ? 'page' : undefined}
            className={clsx(
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[16px]',
              'min-h-[48px] min-w-[48px] px-0.5 py-1.5 transition-colors duration-200',
              'active:scale-[0.97]',
              isActive && !isAi && 'bg-success/15 text-success',
              isActive && isAi && 'bg-ai/15 text-ai',
              !isActive && 'text-text-muted hover:text-text-secondary'
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
