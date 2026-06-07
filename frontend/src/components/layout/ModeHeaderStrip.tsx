import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import { TxModeBadge, type TxMode } from '../ui/TxModeBadge';
import { resolveDataViewMode } from '../../lib/resolveDataViewMode';
import { format, parseISO } from 'date-fns';

function resolveStripMode(input: {
  dataMode: 'demo' | 'live';
  paperModeActive: boolean;
  killSwitch: boolean;
}): TxMode {
  if (input.killSwitch) return 'risk_blocked';
  const view = resolveDataViewMode({
    dataMode: input.dataMode,
    paperModeActive: input.paperModeActive,
  });
  if (view === 'live_journal') return 'live_journal';
  return view;
}

/** Horizontal mode/status strip — sits below fixed header with safe clearance. */
export function ModeHeaderStrip({ className }: { className?: string }) {
  const { dataMode, paperModeActive, botStatus, lastMt5Sync, isSyncing, openMt5SyncModal } =
    useStore();

  const mode = resolveStripMode({
    dataMode,
    paperModeActive,
    killSwitch: Boolean(botStatus?.kill_switch_active),
  });

  const syncLabel = lastMt5Sync?.at
    ? `Synced ${format(parseISO(lastMt5Sync.at), 'MMM d, HH:mm')}`
    : 'Not synced';

  return (
    <div
      className={clsx(
        'sticky z-20 mt-[var(--tx-header-h)] flex max-h-11 items-center gap-2 overflow-x-auto no-scrollbar',
        'border-b border-[var(--tx-line-1)] bg-[var(--tx-bg-1)]/90 backdrop-blur-md',
        'px-[var(--tx-page-x)] py-2',
        className
      )}
      style={{ top: 'var(--tx-header-h)' }}
    >
      <TxModeBadge mode={mode} size="xs" />
      <span className="shrink-0 rounded-[var(--tx-r-pill)] border border-[var(--tx-line-1)] px-2 py-1 text-[10px] font-semibold text-[var(--tx-text-4)]">
        Live execution disabled
      </span>
      {dataMode === 'live' && (
        <span className="shrink-0 rounded-[var(--tx-r-pill)] border border-[var(--tx-line-1)] px-2 py-1 text-[10px] font-semibold text-[var(--tx-text-3)]">
          {botStatus?.kill_switch_active ? 'Risk blocked' : 'Kill switch off'}
        </span>
      )}
      <button
        type="button"
        onClick={() => openMt5SyncModal()}
        disabled={isSyncing}
        className="inline-flex min-h-[32px] shrink-0 items-center gap-1 rounded-[var(--tx-r-pill)] border border-[var(--tx-line-1)] px-2.5 py-1 text-[10px] font-semibold text-[var(--tx-text-3)]"
      >
        <RefreshCw className={clsx('h-3 w-3', isSyncing && 'animate-spin')} aria-hidden />
        {syncLabel}
      </button>
    </div>
  );
}
