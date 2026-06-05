import { clsx } from 'clsx';
import type { PaperAccount } from '../../types';

interface PaperAccountSwitcherProps {
  accounts: PaperAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PaperAccountSwitcher({
  accounts,
  selectedId,
  onSelect,
}: PaperAccountSwitcherProps) {
  if (accounts.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {accounts.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onSelect(a.id)}
          className={clsx(
            'min-h-[44px] rounded-[var(--tx-r-20)] border px-3 py-2 text-left text-sm transition-colors',
            selectedId === a.id
              ? 'border-[var(--tx-info)]/40 bg-[var(--tx-info-soft)]'
              : 'border-[var(--tx-line-1)] bg-[var(--tx-surface-1)] hover:border-[var(--tx-info)]/25'
          )}
        >
          <span className="font-semibold text-[var(--tx-text-1)]">{a.name}</span>
          <span className="mt-0.5 block text-xs text-[var(--tx-text-3)]">
            {(a.balance ?? a.startingBalance).toLocaleString()} {a.currency}
          </span>
        </button>
      ))}
    </div>
  );
}
