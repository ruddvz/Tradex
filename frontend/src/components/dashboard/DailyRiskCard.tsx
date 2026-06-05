import { clsx } from 'clsx';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { TxCard } from '../ui/TxCard';
import { TxButton } from '../ui/TxButton';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

type RiskState = 'safe' | 'caution' | 'near' | 'breached' | 'locked';

function resolveRiskState(input: {
  dailyLossPct?: number;
  maxDailyLossPct?: number;
  killSwitch: boolean;
}): RiskState {
  if (input.killSwitch) return 'locked';
  if (!input.maxDailyLossPct) return 'safe';
  const ratio = (input.dailyLossPct ?? 0) / input.maxDailyLossPct;
  if (ratio >= 1) return 'breached';
  if (ratio >= 0.85) return 'near';
  if (ratio >= 0.6) return 'caution';
  return 'safe';
}

const STATE_COPY: Record<RiskState, { title: string; tone: string; icon: typeof ShieldCheck }> = {
  safe: { title: 'Safe to continue', tone: 'text-[var(--tx-profit)]', icon: ShieldCheck },
  caution: { title: 'Slow down', tone: 'text-[var(--tx-warning)]', icon: AlertTriangle },
  near: { title: 'Daily limit near', tone: 'text-[var(--tx-warning)]', icon: AlertTriangle },
  breached: { title: 'Daily limit breached', tone: 'text-[var(--tx-loss)]', icon: AlertTriangle },
  locked: { title: 'Locked by kill switch', tone: 'text-[var(--tx-loss)]', icon: AlertTriangle },
};

export function DailyRiskCard({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { botStatus, metrics, triggerKillSwitch, resumePaperTrading, dataMode } = useStore();
  const maxDaily = 3;
  const dailyLossPct = Math.max(0, metrics.totalPnl < 0 ? Math.abs(metrics.totalPnl) / 100 : 0);
  const state = resolveRiskState({
    dailyLossPct,
    maxDailyLossPct: maxDaily,
    killSwitch: Boolean(botStatus?.kill_switch_active),
  });
  const copy = STATE_COPY[state];
  const Icon = copy.icon;
  const progress = Math.min(100, (dailyLossPct / maxDaily) * 100);

  return (
    <TxCard
      variant={state === 'safe' ? 'success' : state === 'locked' || state === 'breached' ? 'danger' : 'warning'}
      title="Daily risk status"
      subtitle="Risk before deep analytics"
      className={className}
    >
      <div className="flex items-start gap-3">
        <Icon className={clsx('h-5 w-5 shrink-0 mt-0.5', copy.tone)} aria-hidden />
        <div className="flex-1 min-w-0">
          <p className={clsx('text-sm font-bold', copy.tone)}>{copy.title}</p>
          <p className="mt-1 text-xs text-[var(--tx-text-3)]">
            Daily loss budget {maxDaily}% · Open exposure tracked in Risk Center
          </p>
          <div className="mt-3 h-2 rounded-full bg-[var(--tx-surface-3)] overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all',
                state === 'safe' ? 'bg-[var(--tx-profit)]' : state === 'breached' || state === 'locked' ? 'bg-[var(--tx-loss)]' : 'bg-[var(--tx-warning)]'
              )}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Daily loss limit usage"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <TxButton size="sm" variant="ghost" onClick={() => navigate('/risk')}>
              Open Risk Center
            </TxButton>
            {dataMode === 'live' && (
              <TxButton
                size="sm"
                variant={botStatus?.kill_switch_active ? 'success' : 'danger'}
                onClick={() =>
                  void (botStatus?.kill_switch_active ? resumePaperTrading() : triggerKillSwitch())
                }
              >
                {botStatus?.kill_switch_active ? 'Resume bot' : 'Pause new orders'}
              </TxButton>
            )}
          </div>
        </div>
      </div>
    </TxCard>
  );
}
