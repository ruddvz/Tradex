import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Target,
  BarChart3,
  Calculator,
} from 'lucide-react';
import { clsx } from 'clsx';

const mobileNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/playbooks', label: 'AI', icon: Brain },
  { path: '/propfirm', label: 'Prop', icon: Target },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/calculator', label: 'Calc', icon: Calculator },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-surface/95 backdrop-blur-md border-t border-surface-border',
        'flex items-center justify-around',
        'h-16 px-2'
      )}
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {mobileNavItems.map(({ path, label, icon: Icon }) => {
        const isActive =
          path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
        return (
          <NavLink
            key={path}
            to={path}
            className={clsx(
              'relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 min-w-[52px] transition-all duration-200',
              isActive
                ? 'text-brand-400 bg-brand-500/10'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon
              className={clsx(
                'w-5 h-5',
                isActive && 'drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]'
              )}
            />
            <span className="text-[10px] font-medium leading-none">{label}</span>
            {isActive && (
              <div className="absolute top-1 w-1 h-1 rounded-full bg-brand-400" />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
