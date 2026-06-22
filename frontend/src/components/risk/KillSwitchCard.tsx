import { Octagon, ShieldAlert, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { TxCard } from '../ui/TxCard';
import { TxButton } from '../ui/TxButton';

interface KillSwitchCardProps {
  active: boolean;
  onToggle: () => void;
}

export function KillSwitchCard({ active, onToggle }: KillSwitchCardProps) {
  return (
    <TxCard
      variant={active ? 'danger' : 'warning'}
      title="Kill switch"
      subtitle="Blocks new paper orders. Live broker execution is not available."
    >
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div className="flex items-start gap-3">
          {active ? (
            <ShieldAlert className="h-6 w-6 shrink-0 text-[var(--tx-loss)]" aria-hidden />
          ) : (
            <ShieldCheck className="h-6 w-6 shrink-0 text-[var(--tx-warning)]" aria-hidden />
          )}
          <p className="text-sm text-[var(--tx-text-3)]">
            {active
              ? 'New paper orders are blocked. Resume when you are ready to simulate again.'
              : 'Emergency stop for new paper orders. Use before reviewing a risk breach.'}
          </p>
        </div>
        <TxButton
          variant={active ? 'success' : 'danger'}
          size="md"
          onClick={onToggle}
          className={clsx('shrink-0')}
        >
          <Octagon className="h-4 w-4" />
          {active ? 'Resume paper simulation' : 'Activate kill switch'}
        </TxButton>
      </div>
    </TxCard>
  );
}
