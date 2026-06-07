import { TxCard } from '../ui/TxCard';
import { TxButton } from '../ui/TxButton';
import { TxInput } from '../ui/TxField';
import { TxEmptyState } from '../ui/TxEmptyState';
import type { PaperPositionRow } from '../../lib/api/paper';

interface PaperPositionsCardProps {
  positions: PaperPositionRow[];
  exitPrice: string;
  busy: boolean;
  onExitPriceChange: (v: string) => void;
  onClose: (positionId: string) => void;
}

export function PaperPositionsCard({
  positions,
  exitPrice,
  busy,
  onExitPriceChange,
  onClose,
}: PaperPositionsCardProps) {
  return (
    <TxCard title="Open positions" subtitle="Close creates a journal trade tagged paper">
      <TxInput
        label="Exit price for close"
        value={exitPrice}
        onChange={(e) => onExitPriceChange(e.target.value)}
        inputMode="decimal"
        className="mb-4"
      />
      {positions.length === 0 ? (
        <TxEmptyState title="No open positions" description="Filled paper orders appear here." />
      ) : (
        <ul className="space-y-2">
          {positions.map((p) => (
            <li
              key={p.id}
              className="rounded-[var(--tx-r-16)] border border-[var(--tx-info)]/30 bg-[var(--tx-info-soft)] px-3 py-3 text-sm"
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium text-[var(--tx-text-1)]">
                  {p.symbol} {p.side.toUpperCase()} @ {p.avg_entry_price}
                </span>
                <span className="text-[var(--tx-text-3)]">{p.lot_size} lot</span>
              </div>
              <TxButton
                variant="secondary"
                size="sm"
                className="mt-2"
                disabled={busy}
                onClick={() => onClose(p.id)}
              >
                Close paper position
              </TxButton>
            </li>
          ))}
        </ul>
      )}
    </TxCard>
  );
}
