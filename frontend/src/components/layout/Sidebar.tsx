import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Brain, Target, NotebookPen,
  BarChart3, Calculator, Settings, ChevronLeft, ChevronRight,
  Zap, RefreshCw, TrendingUp, Award
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

const navItems = [
  { path: '/',           label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/journal',    label: 'Trade Journal',  icon: BookOpen },
  { path: '/playbooks',  label: 'AI Playbooks',   icon: Brain },
  { path: '/propfirm',   label: 'Prop Firm Mode', icon: Target },
  { path: '/notebook',   label: 'Notebook',       icon: NotebookPen },
  { path: '/reports',    label: 'Reports',        icon: BarChart3 },
  { path: '/calculator', label: 'Risk Calc',      icon: Calculator },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, account, isSyncing, syncTrades } = useStore();
  const location = useLocation();

  return (
    <aside className={clsx(
      'fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out',
      'bg-surface border-r border-surface-border shadow-xl',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border min-h-[72px]">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="animate-fade-in min-w-0">
            <div className="font-bold text-white text-sm leading-tight">Tradex</div>
            <div className="text-xs text-brand-400">Trader's Lab</div>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto flex-shrink-0 p-1.5 rounded-lg hover:bg-surface-light text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Account Badge */}
      <div className="px-3 py-3 border-b border-surface-border">
        <div className={clsx(
          'flex items-center gap-2.5 p-2.5 rounded-lg bg-dark-300 border',
          account.connected ? 'border-brand-500/30' : 'border-red-500/30'
        )}>
          <div className={clsx(
            'flex-shrink-0 w-2 h-2 rounded-full',
            account.connected ? 'bg-brand-400 shadow-glow-sm animate-pulse-slow' : 'bg-red-400'
          )} />
          {sidebarOpen && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <div className="text-xs font-semibold text-white truncate">{account.name}</div>
              <div className="text-xs text-slate-500">{account.broker}</div>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={() => syncTrades()}
              disabled={isSyncing}
              className="flex-shrink-0 p-1 rounded hover:bg-surface-border transition-colors"
              title="Sync trades"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5 text-slate-400', isSyncing && 'animate-spin text-brand-400')} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {sidebarOpen && (
          <div className="px-2 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Main
          </div>
        )}
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              title={!sidebarOpen ? label : undefined}
              className={clsx(
                'flex items-center rounded-lg transition-all duration-200 group',
                sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-2.5',
                isActive
                  ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-surface-light border border-transparent'
              )}
            >
              <Icon className={clsx('flex-shrink-0 w-5 h-5', isActive ? 'text-brand-400' : '')} />
              {sidebarOpen && (
                <span className="text-sm font-medium animate-fade-in">{label}</span>
              )}
              {isActive && sidebarOpen && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
              )}
            </NavLink>
          );
        })}

        {sidebarOpen && (
          <div className="px-2 pt-4 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Account
          </div>
        )}
        <NavLink
          to="/settings"
          title={!sidebarOpen ? 'Settings' : undefined}
          className={clsx(
            'flex items-center rounded-lg transition-all duration-200',
            sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-2.5',
            location.pathname === '/settings'
              ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20'
              : 'text-slate-400 hover:text-white hover:bg-surface-light border border-transparent'
          )}
        >
          <Settings className="flex-shrink-0 w-5 h-5" />
          {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
        </NavLink>
      </nav>

      {/* Bottom Balance */}
      {sidebarOpen && (
        <div className="px-3 py-4 border-t border-surface-border">
          <div className="p-3 rounded-lg bg-gradient-to-r from-brand-500/10 to-blue-500/10 border border-brand-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Balance</span>
              <Award className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <div className="text-lg font-bold text-white">
              ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3 text-brand-400" />
              <span className="text-xs text-brand-400">+{((account.equity - account.balance) / account.balance * 100).toFixed(2)}% open P&L</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
