import { Shield, ShieldAlert, ShieldOff } from 'lucide-react';
import { clsx } from 'clsx';
import { TxCard } from '../ui/TxCard';

type RiskHeroState = 'safe' | 'slow' | 'stop' | 'locked' | 'blocked';

const CONFIG: Record<
  RiskHeroState,
  { label: string; description: string; icon: typeof Shield; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  safe: {
    label: 'Safe to continue',
    description: 'Daily risk is within limits.',
    icon: Shield,
    variant: 'success',
  },
  slow: {
    label: 'Slow down',
    description: 'You are approaching configured daily loss limits.',
    icon: ShieldAlert,
    variant: 'warning',
  },
  stop: {
    label: 'Stop trading',
    description: 'Daily loss limit is near breach — reduce size or pause.',
    icon: ShieldAlert,
    variant: 'danger',
  },
  locked: {
    label: 'Locked by kill switch',
    description: 'Paper bot paused. No new simulated orders.',
    icon: ShieldOff,
    variant: 'danger',
  },
  blocked: {
    label: 'Live blocked',
    description: 'Live trading is locked until readiness checks pass.',
    icon: ShieldOff,
    variant: 'default',
  },
};

export function RiskStatusHero({ state }: { state: RiskHeroState }) {
  const cfg = CONFIG[state];
  const Icon = cfg.icon;
  return (
    <TxCard variant={cfg.variant} padded>
      <div className="flex items-start gap-3">
        <Icon className={clsx('h-6 w-6 shrink-0')} aria-hidden />
        <div>
          <p className="text-lg font-bold text-[var(--tx-text-1)]">{cfg.label}</p>
          <p className="mt-1 text-sm text-[var(--tx-text-3)]">{cfg.description}</p>
        </div>
      </div>
    </TxCard>
  );
}

export function DailyLossProgress({
  usedPct,
  limitPct,
}: {
  usedPct: number;
  limitPct: number;
}) {
  const ratio = Math.min(100, (usedPct / limitPct) * 100);
  return (
    <TxCard title="Daily loss limit" subtitle={`${limitPct}% configured max`}>
      <div className="h-3 rounded-full bg-[var(--tx-surface-3)] overflow-hidden">
        <div
          className="h-full bg-[var(--tx-loss)] rounded-full"
          style={{ width: `${ratio}%` }}
          role="progressbar"
          aria-valuenow={ratio}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--tx-text-3)]">
        {usedPct.toFixed(1)}% of daily budget used
      </p>
    </TxCard>
  );
}

export function OpenExposureCard({ exposure, openTrades }: { exposure: number; openTrades: number }) {
  return (
    <TxCard title="Open exposure" subtitle="Simulated + journal risk snapshot">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-[var(--tx-text-4)]">At risk</p>
          <p className="text-xl font-bold text-[var(--tx-text-1)]">${exposure.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--tx-text-4)]">Open trades</p>
          <p className="text-xl font-bold text-[var(--tx-text-1)]">{openTrades}</p>
        </div>
      </div>
    </TxCard>
  );
}
