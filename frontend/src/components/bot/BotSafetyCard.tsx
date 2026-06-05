import { ShieldAlert } from 'lucide-react';
import { TxCard } from '../ui/TxCard';
import { TxButton } from '../ui/TxButton';
import { useStore } from '../../store/useStore';

export function BotSafetyCard() {
  const { botStatus, triggerKillSwitch, resumePaperTrading, dataMode } = useStore();
  const killed = botStatus?.kill_switch_active;

  return (
    <TxCard title="Safety controls" subtitle="Always visible on bot and risk screens" variant="warning">
      <ul className="space-y-2 text-sm text-[var(--tx-text-2)]">
        <li className="flex justify-between gap-2">
          <span>Kill switch</span>
          <span className={killed ? 'text-[var(--tx-loss)] font-bold' : 'text-[var(--tx-profit)]'}>
            {killed ? 'Active' : 'Off'}
          </span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Max daily loss</span>
          <span>3%</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Max trade risk</span>
          <span>1%</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Max open trades</span>
          <span>3</span>
        </li>
      </ul>
      {dataMode === 'live' && (
        <TxButton
          className="mt-4"
          variant={killed ? 'success' : 'danger'}
          fullWidth
          onClick={() => void (killed ? resumePaperTrading() : triggerKillSwitch())}
        >
          <ShieldAlert className="h-4 w-4" aria-hidden />
          {killed ? 'Resume paper bot' : 'Stop new paper orders'}
        </TxButton>
      )}
    </TxCard>
  );
}
