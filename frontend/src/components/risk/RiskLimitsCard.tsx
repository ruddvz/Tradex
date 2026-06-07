import { Link } from 'react-router-dom';
import { Settings, Shield } from 'lucide-react';
import { TxCard } from '../ui/TxCard';
import { TxInput } from '../ui/TxField';
import type { RiskProfileRow } from '../../lib/api/risk';

interface RiskLimitsCardProps {
  profile: RiskProfileRow;
  saving: boolean;
  onPatch: (patch: Partial<RiskProfileRow>) => void;
}

export function RiskLimitsCard({ profile, saving, onPatch }: RiskLimitsCardProps) {
  const fields = [
    {
      label: 'Max risk / trade',
      key: 'max_risk_per_trade_percent' as const,
      value: profile.max_risk_per_trade_percent,
      suffix: '%',
    },
    {
      label: 'Max daily loss',
      key: 'max_daily_loss_percent' as const,
      value: profile.max_daily_loss_percent,
      suffix: '%',
    },
    {
      label: 'Max open positions',
      key: 'max_open_positions' as const,
      value: profile.max_open_positions,
      suffix: '',
    },
  ];

  return (
    <TxCard
      title={profile.name}
      subtitle="Risk limits — tap to edit on mobile"
      action={
        <Link
          to="/settings"
          className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-[var(--tx-info)]"
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
        </Link>
      }
    >
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-[var(--tx-info)]" aria-hidden />
        <button
          type="button"
          disabled={saving}
          className="text-sm font-semibold text-[var(--tx-text-1)]"
          onClick={() => onPatch({ require_stop_loss: !profile.require_stop_loss })}
        >
          Stop loss required: {profile.require_stop_loss ? 'Yes' : 'No'}
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((item) => (
          <TxInput
            key={item.key}
            label={item.label}
            type="number"
            defaultValue={String(item.value)}
            disabled={saving}
            helper={item.suffix || undefined}
            onBlur={(e) => {
              const n = parseFloat(e.target.value);
              if (Number.isFinite(n)) onPatch({ [item.key]: n });
            }}
          />
        ))}
      </div>
    </TxCard>
  );
}
