import { clsx } from 'clsx';
import { TxCard } from '../ui/TxCard';
import { TxEmptyState } from '../ui/TxEmptyState';
import type { PaperOrderRow } from '../../lib/api/paper';

const ORDER_STATUS_CLASS: Record<string, string> = {
  filled: 'text-[var(--tx-profit)]',
  rejected: 'text-[var(--tx-loss)]',
  submitted: 'text-[var(--tx-warning)]',
  accepted: 'text-[var(--tx-info)]',
};

export function PaperOrdersCard({ orders }: { orders: PaperOrderRow[] }) {
  return (
    <TxCard title="Orders" subtitle="Paper mode — not live fills">
      {orders.length === 0 ? (
        <TxEmptyState title="No orders yet" description="Submit a paper order from the ticket above." />
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li
              key={o.id}
              className={clsx(
                'rounded-[var(--tx-r-16)] border px-3 py-3 text-sm',
                o.status === 'rejected'
                  ? 'border-[var(--tx-loss)]/30 bg-[var(--tx-loss-soft)]'
                  : 'border-[var(--tx-line-1)] bg-[var(--tx-surface-inset)]'
              )}
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium text-[var(--tx-text-1)]">
                  {o.symbol} {o.side.toUpperCase()} · {o.lot_size} lot
                </span>
                <span
                  className={clsx(
                    'shrink-0 text-xs font-bold uppercase',
                    ORDER_STATUS_CLASS[o.status] ?? 'text-[var(--tx-text-4)]'
                  )}
                >
                  {o.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--tx-text-4)]">
                {o.created_at ? new Date(o.created_at).toLocaleString() : '—'} · Paper trade
              </p>
              {o.rejection_reason && (
                <p className="mt-1 text-xs text-[var(--tx-loss)]">{o.rejection_reason}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </TxCard>
  );
}
