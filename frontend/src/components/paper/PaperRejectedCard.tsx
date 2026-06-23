import { TxCard } from '../ui/TxCard';
import { TxEmptyState } from '../ui/TxEmptyState';
import { Link } from 'react-router-dom';
import type { PaperOrderRow } from '../../lib/api/paper';

export function PaperRejectedCard({ orders }: { orders: PaperOrderRow[] }) {
  const rejected = orders.filter((o) => o.status === 'rejected');

  return (
    <TxCard
      title="Rejected orders"
      subtitle="Risk blocked — useful safety feedback"
      variant="warning"
    >
      {rejected.length === 0 ? (
        <TxEmptyState
          title="No rejected orders"
          description="When risk rules block an order, the reason appears here."
        />
      ) : (
        <ul className="space-y-2">
          {rejected.map((o) => (
            <li
              key={o.id}
              className="rounded-[var(--tx-r-16)] border border-[var(--tx-loss)]/35 bg-[var(--tx-loss-soft)] px-3 py-3 text-sm"
            >
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-[var(--tx-text-1)]">
                  {o.symbol} {o.side.toUpperCase()} · {o.lot_size} lot
                </span>
                <span className="text-xs font-bold uppercase text-[var(--tx-loss)]">
                  Risk blocked
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--tx-text-3)]">
                {o.rejection_reason ?? 'Rule breached'}
              </p>
              <p className="mt-1 text-xs text-[var(--tx-text-4)]">
                Fix: review limits in Risk Center
              </p>
            </li>
          ))}
        </ul>
      )}
      <Link
        to="/risk"
        className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-[var(--tx-info)]"
      >
        Open Risk Center →
      </Link>
    </TxCard>
  );
}
