import { Bell, Plus, RefreshCw, ChevronDown, Octagon, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';
import { ModeBadge } from '../status/ModeBadge';
import { DataModeBadge } from '../ui/DataModeBadge';
import { resolveAppMode } from '../../lib/resolveAppMode';
import { resolveDataViewMode } from '../../lib/resolveDataViewMode';
import { AccountSelector } from './AccountSelector';
import { DataSourceBadge } from '../status/DataSourceBadge';

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
  /** Mobile cockpit header — title row only; mode strip lives in ModeHeaderStrip */
  compact?: boolean;
}

export function Header({
  title,
  subtitle,
  showDateRange = true,
  action,
  onAddTrade,
  compact = false,
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
    lastMt5Sync,
  } = useStore();

  return (
    <header
      className={clsx(
        'no-print header-safe fixed top-0 right-0 z-30',
        'bg-[rgba(4,7,17,0.82)] backdrop-blur-xl border-b border-[var(--tx-line-1)]',
        'transition-all duration-300 ease-[var(--tx-ease-out)]',
        'left-0',
        sidebarOpen ? 'md:left-64' : 'md:left-16'
      )}
    >
      <div className="flex items-center gap-2 px-[var(--tx-page-x)] md:px-5">
        <button
          type="button"
          className="header-icon-button sm:hidden shrink-0"
          aria-label="Open settings"
          onClick={() => navigate('/settings')}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--tx-profit)] to-[var(--tx-info)] flex items-center justify-center text-xs font-bold text-[#04110d]">
            TX
          </div>
        </button>

        <div className="flex-1 min-w-0 py-1">
          <h1 className="text-lg md:text-xl font-bold text-[var(--tx-text-1)] tracking-tight truncate">
            {title}
          </h1>
          {subtitle && !compact && (
            <p className="text-xs text-[var(--tx-text-3)] truncate hidden sm:block">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!compact && (
            <>
              <DataModeBadge
                mode={resolveDataViewMode({ dataMode, paperModeActive })}
                className="hidden lg:inline-flex"
              />
              <ModeBadge
                mode={resolveAppMode({ dataMode, paperModeActive })}
                className="hidden md:inline-flex lg:hidden"
              />
            </>
          )}

          {dataMode === 'live' && !compact && (
            <button
              type="button"
              onClick={() =>
                void (botStatus?.kill_switch_active ? resumePaperTrading() : triggerKillSwitch())
              }
              className={clsx(
                'header-icon-button hidden sm:inline-flex',
                botStatus?.kill_switch_active && 'text-[var(--tx-loss)] border-[var(--tx-loss)]/40'
              )}
              aria-label={botStatus?.kill_switch_active ? 'Resume paper bot' : 'Kill switch'}
            >
              <Octagon className="w-[21px] h-[21px]" />
            </button>
          )}

          <button
            type="button"
            onClick={() => openMt5SyncModal()}
            disabled={isSyncing}
            className="header-icon-button disabled:opacity-50 hidden sm:inline-flex"
            aria-label="Sync MT5"
          >
            <RefreshCw
              className={clsx(
                'w-[21px] h-[21px]',
                isSyncing && 'animate-spin text-[var(--tx-profit)]'
              )}
            />
          </button>

          <button type="button" className="header-icon-button relative" aria-label="Notifications">
            <Bell className="w-[21px] h-[21px]" />
            {aiInsights.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--tx-profit)] border-2 border-[var(--tx-bg-0)]" />
            )}
          </button>

          {action ??
            (onAddTrade ? (
              <button
                type="button"
                className="header-icon-button sm:hidden"
                aria-label="Add trade"
                onClick={onAddTrade}
              >
                <Plus className="w-[21px] h-[21px]" />
              </button>
            ) : null)}

          <button
            type="button"
            className="header-icon-button hidden sm:flex"
            aria-label="Open settings"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-[21px] h-[21px]" />
          </button>
          <button
            type="button"
            className="header-icon-button hidden md:flex gap-2 px-2 w-auto"
            aria-label="Account menu"
            onClick={() => navigate('/settings')}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--tx-profit)] to-[var(--tx-info)] flex items-center justify-center text-xs font-bold text-[#04110d]">
              T
            </div>
            <ChevronDown className="w-4 h-4 text-[var(--tx-text-3)] self-center" />
          </button>
        </div>
      </div>

      {!compact && (
        <div className="hidden md:flex items-center gap-3 px-5 pb-3 flex-wrap">
          <AccountSelector />
          {lastMt5Sync?.demo_fallback_used && (
            <DataSourceBadge source="demo" className="!text-amber-200" />
          )}
          {dataMode === 'live' && <DataSourceBadge source="live" />}
          {showDateRange && (
            <div className="flex items-center gap-1 bg-[var(--tx-surface-1)] rounded-xl p-1 border border-[var(--tx-line-1)]">
              {ranges.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setDateRange(r.key)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px]',
                    selectedDateRange === r.key
                      ? 'bg-[var(--tx-profit-soft)] text-[var(--tx-profit)] border border-[var(--tx-profit)]/35'
                      : 'text-[var(--tx-text-3)] hover:text-[var(--tx-text-1)]'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
          {action ?? (
            <button type="button" className="btn-primary text-sm ml-auto" onClick={onAddTrade}>
              <Plus className="w-4 h-4" />
              Add Trade
            </button>
          )}
        </div>
      )}
    </header>
  );
}
