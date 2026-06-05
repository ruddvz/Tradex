import { TxBottomSheet } from '../ui/TxBottomSheet';
import { DirectionBadge, GradeBadge, PnlBadge } from '../ui/Badge';
import { format, parseISO } from 'date-fns';
import type { Trade } from '../../types';

interface TradeDetailSheetProps {
  trade: Trade | null;
  open: boolean;
  onClose: () => void;
}

export function TradeDetailSheet({ trade, open, onClose }: TradeDetailSheetProps) {
  if (!trade) return null;
  return (
    <TxBottomSheet open={open} onClose={onClose} title={`${trade.symbol} ${trade.direction}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <PnlBadge value={trade.pnl} />
          <DirectionBadge direction={trade.direction} />
          <GradeBadge grade={trade.grade} />
        </div>
        <section>
          <h3 className="text-xs font-bold uppercase text-[var(--tx-text-4)]">Entry / exit</h3>
          <p className="mt-1 text-sm text-[var(--tx-text-2)]">
            {format(parseISO(trade.entryTime), 'MMM d, HH:mm')} →{' '}
            {format(parseISO(trade.exitTime), 'HH:mm')}
          </p>
          <p className="text-sm text-[var(--tx-text-3)]">
            {trade.entryPrice} → {trade.exitPrice} · {trade.lotSize} lots
          </p>
        </section>
        <section>
          <h3 className="text-xs font-bold uppercase text-[var(--tx-text-4)]">Risk</h3>
          <p className="mt-1 text-sm text-[var(--tx-text-2)]">
            R {trade.rMultiple} · RR {trade.riskReward}
          </p>
        </section>
        <section>
          <h3 className="text-xs font-bold uppercase text-[var(--tx-text-4)]">Psychology</h3>
          <p className="mt-1 text-sm text-[var(--tx-text-2)]">
            {trade.emotion} · {trade.strategy} · {trade.session}
          </p>
        </section>
        {trade.notes && (
          <section>
            <h3 className="text-xs font-bold uppercase text-[var(--tx-text-4)]">Notes</h3>
            <p className="mt-1 text-sm text-[var(--tx-text-3)]">{trade.notes}</p>
          </section>
        )}
      </div>
    </TxBottomSheet>
  );
}
