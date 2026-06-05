import { Activity, Pause, Play } from 'lucide-react';
import { TxCard } from '../ui/TxCard';
import { TxButton } from '../ui/TxButton';
import { TxModePill } from '../status/TxModePill';
import { useStore } from '../../store/useStore';
import { formatPnl } from '../../lib/formatters';

export function BotStatusCard() {
  const { botStatus, paperAccounts, triggerKillSwitch, resumePaperTrading, dataMode } = useStore();
  const account = paperAccounts[0];
  const running = Boolean(botStatus && !botStatus.kill_switch_active && !botStatus.paper_orders_paused);
  const paused = Boolean(botStatus?.kill_switch_active || botStatus?.paper_orders_paused);

  return (
    <TxCard
      title="Paper Bot"
      subtitle="Simulated execution only — no live orders"
      variant="default"
      action={<TxModePill mode="paper" />}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--tx-radius-sm)] bg-[var(--tx-info-soft)]">
          <Activity className="h-5 w-5 text-[var(--tx-info)]" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--tx-text-1)]">
            {paused ? 'Paused' : running ? 'Running' : 'Idle'}
          </p>
          <p className="text-xs text-[var(--tx-text-3)]">
            {account
              ? `${account.name} · ${formatPnl(account.balance ?? 10000)} balance`
              : 'No paper account — create one to simulate'}
          </p>
          {account && (
            <p className="mt-1 text-[11px] text-[var(--tx-text-4)]">
              Live execution: {botStatus?.live_execution_enabled ? 'enabled' : 'disabled'}
            </p>
          )}
        </div>
      </div>
      {dataMode === 'live' && (
        <div className="mt-4 flex flex-wrap gap-2">
          <TxButton
            size="sm"
            variant={paused ? 'success' : 'secondary'}
            onClick={() => void (paused ? resumePaperTrading() : triggerKillSwitch())}
          >
            {paused ? (
              <>
                <Play className="h-4 w-4" /> Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" /> Pause bot
              </>
            )}
          </TxButton>
        </div>
      )}
    </TxCard>
  );
}
