import { Bell, Plus, RefreshCw, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

const ranges = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: 'all', label: 'All Time' },
] as const;

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onAddTrade?: () => void;
}

export function Header({ title, subtitle, action, onAddTrade }: HeaderProps) {
  const { sidebarOpen, selectedDateRange, setDateRange, isSyncing, syncTrades, aiInsights } =
    useStore();

  return (
    <header
      className={clsx(
        'no-print fixed top-0 right-0 z-30 flex items-center gap-3 px-4 sm:px-6',
        'bg-dark-400/90 backdrop-blur-md border-b border-surface-border',
        'transition-all duration-300',
        'left-0',
        sidebarOpen ? 'md:left-64' : 'md:left-16',
        'pt-[env(safe-area-inset-top)]'
      )}
      style={{ height: 'calc(4rem + env(safe-area-inset-top))' }}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-white truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>

      {/* Date range selector */}
      <div className="hidden sm:flex items-center gap-1 bg-surface rounded-lg p-1 border border-surface-border">
        {ranges.map(r => (
          <button
            key={r.key}
            type="button"
            onClick={() => setDateRange(r.key)}
            className={clsx(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
              selectedDateRange === r.key
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-surface-light'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Sync button */}
      <button
        type="button"
        onClick={() => syncTrades()}
        disabled={isSyncing}
        className="p-2 rounded-lg hover:bg-surface-light text-slate-400 hover:text-white transition-colors border border-surface-border"
        title="Sync MT5"
      >
        <RefreshCw className={clsx('w-4 h-4', isSyncing && 'animate-spin text-brand-400')} />
      </button>

      {/* Notifications */}
      <button
        type="button"
        className="relative p-2 rounded-lg hover:bg-surface-light text-slate-400 hover:text-white transition-colors border border-surface-border"
      >
        <Bell className="w-4 h-4" />
        {aiInsights.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-400 border border-dark-400" />
        )}
      </button>

      {/* Add Trade */}
      {action ?? (
        <button
          type="button"
          className="btn-primary text-sm hidden sm:flex"
          onClick={onAddTrade}
        >
          <Plus className="w-4 h-4" />
          Add Trade
        </button>
      )}

      {/* Profile */}
      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-light cursor-pointer border border-surface-border transition-colors">
        <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
          T
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </div>
    </header>
  );
}
