import { TxBottomSheet } from '../ui/TxBottomSheet';
import { TxButton } from '../ui/TxButton';

export type JournalFilterState = {
  status: 'all' | 'WIN' | 'LOSS';
  symbol: string;
  strategy: string;
  session: string;
};

interface TradeFilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: JournalFilterState;
  onChange: (next: JournalFilterState) => void;
  symbols: string[];
  strategies: string[];
}

export function TradeFilterSheet({
  open,
  onClose,
  filters,
  onChange,
  symbols,
  strategies,
}: TradeFilterSheetProps) {
  return (
    <TxBottomSheet
      open={open}
      onClose={onClose}
      title="Filter trades"
      description="Advanced filters for journal review"
      footer={
        <TxButton fullWidth variant="primary" onClick={onClose}>
          Apply filters
        </TxButton>
      }
    >
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[var(--tx-text-2)]">
          Outcome
          <select
            className="select mt-1 w-full text-base"
            value={filters.status}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as JournalFilterState['status'] })
            }
          >
            <option value="all">All</option>
            <option value="WIN">Wins</option>
            <option value="LOSS">Losses</option>
          </select>
        </label>
        <label className="block text-sm font-semibold text-[var(--tx-text-2)]">
          Symbol
          <select
            className="select mt-1 w-full text-base"
            value={filters.symbol}
            onChange={(e) => onChange({ ...filters, symbol: e.target.value })}
          >
            <option value="">All symbols</option>
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-[var(--tx-text-2)]">
          Strategy
          <select
            className="select mt-1 w-full text-base"
            value={filters.strategy}
            onChange={(e) => onChange({ ...filters, strategy: e.target.value })}
          >
            <option value="">All strategies</option>
            {strategies.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
    </TxBottomSheet>
  );
}
