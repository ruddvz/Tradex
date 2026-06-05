import { Link } from 'react-router-dom';
import { RefreshCw, Shield, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import { DataModeBadge } from '../ui/DataModeBadge';
import { resolveDataViewMode } from '../../lib/resolveDataViewMode';
import { AccountSelector } from '../layout/AccountSelector';

export function DashboardStatusStrip() {
  const {
    dataMode,
    paperModeActive,
    isSyncing,
    openMt5SyncModal,
    botStatus,
    bootstrapError,
    paperAccounts,
  } = useStore();

  const viewMode = resolveDataViewMode({ dataMode, paperModeActive });
  const killed = botStatus?.kill_switch_active;

  return (
    <div
      className={clsx(
        'rounded-xl border border-surface-border bg-surface/30 px-4 py-3',
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'
      )}
    >
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <DataModeBadge mode={viewMode} />
        {killed && (
          <span className="text-[10px] font-bold uppercase text-loss border border-loss/40 rounded px-2 py-0.5">
            Kill switch on
          </span>
        )}
        {bootstrapError && (
          <span className="text-xs text-loss truncate max-w-xs" title={bootstrapError}>
            Sync error
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <AccountSelector compact />
        {paperAccounts.length > 0 && (
          <Link
            to="/paper-trading"
            className="inline-flex items-center gap-1 text-xs font-semibold text-analytics hover:underline min-h-[44px] px-2"
          >
            <Wallet className="w-3.5 h-3.5" />
            Paper ({paperAccounts.length})
          </Link>
        )}
        <Link
          to="/risk"
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-text-primary min-h-[44px] px-2"
        >
          <Shield className="w-3.5 h-3.5" />
          Risk
        </Link>
        <button
          type="button"
          onClick={() => openMt5SyncModal()}
          disabled={isSyncing}
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-success min-h-[44px] px-2 disabled:opacity-50"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
          MT5
        </button>
      </div>
    </div>
  );
}
