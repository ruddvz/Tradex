import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Target,
  Settings,
} from 'lucide-react';
import { clsx } from 'clsx';

/** NEXT_STEPS Phase 5: five primary destinations on small screens (sidebar on md+). */
const mobileNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/playbooks', label: 'Playbooks', icon: Brain },
  { path: '/propfirm', label: 'Prop', icon: Target },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav
      role="navigation"
      aria-label="Primary mobile"
      className={clsx(
        'fixed z-50 md:hidden',
        'left-4 right-4 bottom-4',
        'min-h-[72px] rounded-nav',
        'flex items-stretch justify-between gap-1 px-2 pt-2',
        'bg-[rgba(12,18,32,0.78)] backdrop-blur-[22px]',
        'border border-[rgba(126,146,185,0.18)]',
        'shadow-[0_20px_60px_rgba(0,0,0,0.42)]'
      )}
      style={{
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      {mobileNavItems.map(({ path, label, icon: Icon }) => {
        const isActive =
          path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
        const isPlaybooks = path === '/playbooks';
        return (
          <NavLink
            key={path}
            to={path}
            end={path === '/' || path === '/settings'}
            aria-current={isActive ? 'page' : undefined}
            className={clsx(
              'relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[18px] min-h-[48px] px-1 py-2 transition-colors duration-200',
              isActive && !isPlaybooks && 'bg-success/15 text-success',
              isActive && isPlaybooks && 'bg-ai/15 text-ai',
              !isActive && 'text-text-muted hover:text-text-secondary'
            )}
          >
            <Icon className="w-[22px] h-[22px] shrink-0" strokeWidth={isActive ? 2.25 : 2} />
            <span className="text-[10px] font-semibold leading-none">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
