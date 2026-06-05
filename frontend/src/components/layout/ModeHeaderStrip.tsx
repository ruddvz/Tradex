import { RefreshCw, Octagon } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import { TxModePill } from '../status/TxModePill';
import { resolveTxMode } from '../../lib/resolveTxMode';
import { format, parseISO } from 'date-fns';

/** Horizontal mode/status strip — mobile row 2 under header. */
export function ModeHeaderStrip({ className }: { className?: string }) {
  const {
    dataMode,
    paperModeActive,
    botStatus,
    lastMt5Sync,
    isSyncing,
    openMt5SyncModal,
    triggerKillSwitch,
    resumePaperTrading,
  } = useStore();

  const mode = resolveTxMode({
    dataMode,
    paperModeActive,
    liveReadinessPassed: false,
    liveBlocked: botStatus?.kill_switch_active,
  });

  const syncLabel = lastMt5Sync?.at
    ? `Synced ${format(parseISO(lastMt5Sync.at), 'MMM d, HH:mm')}`
    : 'Not synced';

  return (
    <div
      className={clsx(
        'flex items-center gap-2 overflow-x-auto no-scrollbar px-[var(--tx-page-x)] py-2 max-h-11 md:max-h-none',
        'border-b border-[var(--tx-line-1)] bg-[var(--tx-bg-1)]/80 backdrop-blur-md',
        className
      )}
    >
      <TxModePill mode={mode} />
      <span className="shrink-0 rounded-[var(--tx-r-pill)] border border-[var(--tx-line-1)] px-2 py-1 text-[10px] font-semibold text-[var(--tx-text-4)]">
        Live execution disabled
      </span>
      {dataMode === 'live' && (
        <span className="shrink-0 rounded-[var(--tx-radius-pill)] border border-[var(--tx-line-1)] px-2 py-1 text-[10px] font-semibold text-[var(--tx-text-3)]">
          {botStatus?.kill_switch_active ? 'Kill switch ON' : 'Kill switch off'}
        </span>
      )}
      <button
        type="button"
        onClick={() => openMt5SyncModal()}
        disabled={isSyncing}
        className="inline-flex shrink-0 items-center gap-1 rounded-[var(--tx-radius-pill)] border border-[var(--tx-line-1)] px-2.5 py-1 text-[10px] font-semibold text-[var(--tx-text-3)] min-h-[32px]"
      >
        <RefreshCw className={clsx('h-3 w-3', isSyncing && 'animate-spin')} aria-hidden />
        {syncLabel}
      </button>
      {dataMode === 'live' && (
        <button
          type="button"
          aria-label={botStatus?.kill_switch_active ? 'Resume paper bot' : 'Activate kill switch'}
          onClick={() =>
            void (botStatus?.kill_switch_active ? resumePaperTrading() : triggerKillSwitch())
          }
          className={clsx(
            'ml-auto inline-flex shrink-0 items-center gap-1 rounded-[var(--tx-radius-pill)] border px-2.5 py-1 text-[10px] font-bold min-h-[32px]',
            botStatus?.kill_switch_active
              ? 'border-[var(--tx-loss)]/40 text-[var(--tx-loss)] bg-[var(--tx-loss-soft)]'
              : 'border-[var(--tx-line-1)] text-[var(--tx-text-3)]'
          )}
        >
          <Octagon className="h-3 w-3" aria-hidden />
          {botStatus?.kill_switch_active ? 'Resume' : 'Kill'}
        </button>
      )}
    </div>
  );
}
