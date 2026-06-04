import { Bell, Plus, RefreshCw, ChevronDown, Octagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';
import { ModeBadge } from '../status/ModeBadge';
import { resolveAppMode } from '../../lib/resolveAppMode';

const ranges = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: 'all', label: 'All Time' },
] as const;

interface HeaderProps {
  title: string;
  subtitle?: string;
  showDateRange?: boolean;
  action?: React.ReactNode;
  onAddTrade?: () => void;
}

export function Header({
  title,
  subtitle,
  showDateRange = true,
  action,
  onAddTrade,
}: HeaderProps) {
  const navigate = useNavigate();
  const {
    sidebarOpen,
    selectedDateRange,
    setDateRange,
    isSyncing,
    openMt5SyncModal,
    aiInsights,
    dataMode,
    paperModeActive,
    botStatus,
    triggerKillSwitch,
    resumePaperTrading,
  } = useStore();

  return (
    <header
      className={clsx(
        'no-print header-safe fixed top-0 right-0 z-30 flex items-center gap-3',
        'bg-[rgba(5,8,18,0.72)] backdrop-blur-xl border-b border-[rgba(126,146,185,0.14)]',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'left-0',
        sidebarOpen ? 'md:left-64' : 'md:left-16'
      )}
    >
      <div className="flex-1 min-w-0 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-text-primary tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-text-muted truncate mt-0.5">{subtitle}</p>}
        </div>
        <ModeBadge mode={resolveAppMode({ dataMode, paperModeActive })} className="mt-0.5" />
      </div>

      {showDateRange && (
        <div className="hidden sm:flex items-center gap-1 bg-surface/80 rounded-xl p-1 border border-[rgba(126,146,185,0.18)]">
          {ranges.map(r => (
            <button
              key={r.key}
              type="button"
              onClick={() => setDateRange(r.key)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                selectedDateRange === r.key
                  ? 'bg-success/15 text-success border border-success/35'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-light'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {dataMode === 'live' && (
        <button
          type="button"
          onClick={() => void (botStatus?.kill_switch_active ? resumePaperTrading() : triggerKillSwitch())}
          className={clsx(
            'header-icon-button',
            botStatus?.kill_switch_active && 'text-loss border-loss/40'
          )}
          title={
            botStatus?.kill_switch_active
              ? 'Resume paper trading'
              : 'Kill switch — stop new paper orders'
          }
        >
          <Octagon className="w-[21px] h-[21px]" />
        </button>
      )}

      <button
        type="button"
        onClick={() => openMt5SyncModal()}
        disabled={isSyncing}
        className="header-icon-button disabled:opacity-50"
        title="Sync MT5"
      >
        <RefreshCw className={clsx('w-[21px] h-[21px]', isSyncing && 'animate-spin text-success')} />
      </button>

      <button type="button" className="header-icon-button relative">
        <Bell className="w-[21px] h-[21px]" />
        {aiInsights.length > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-success border-2 border-[rgba(5,8,18,0.9)]" />
        )}
      </button>

      {action ?? (
        <button type="button" className="btn-primary text-sm hidden sm:flex" onClick={onAddTrade}>
          <Plus className="w-4 h-4" />
          Add Trade
        </button>
      )}

      <button
        type="button"
        className="header-icon-button sm:hidden p-0 overflow-hidden"
        aria-label="Open settings"
        onClick={() => navigate('/settings')}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-success/90 to-analytics/90 flex items-center justify-center text-xs font-bold text-[#04110d]">
          T
        </div>
      </button>
      <button
        type="button"
        className="header-icon-button hidden sm:flex gap-2 px-2 w-auto"
        aria-label="Open settings"
        onClick={() => navigate('/settings')}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-success/90 to-analytics/90 flex items-center justify-center text-xs font-bold text-[#04110d]">
          T
        </div>
        <ChevronDown className="w-4 h-4 text-text-muted self-center" />
      </button>
    </header>
  );
}
