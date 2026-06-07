import { TxCard } from '../ui/TxCard';
import { TxLoadingState } from '../ui/TxLoadingState';
import type { AuditEventRow } from '../../lib/api/risk';

export function RiskEventTimeline({
  events,
  loading,
}: {
  events: AuditEventRow[] | null;
  loading?: boolean;
}) {
  return (
    <TxCard title="Risk event timeline" subtitle="Kill switch, overrides, and audit log">
      {loading || events === null ? (
        <TxLoadingState label="Loading events…" />
      ) : events.length === 0 ? (
        <p className="text-sm text-[var(--tx-text-3)]">No audit events recorded yet.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li
              key={e.id}
              className="border-l-2 border-[var(--tx-line-2)] py-1 pl-3 text-xs text-[var(--tx-text-2)]"
            >
              <span className="mr-2 font-bold uppercase text-[var(--tx-text-4)]">
                {e.event_type.replace(/_/g, ' ')}
              </span>
              {e.message}
            </li>
          ))}
        </ul>
      )}
    </TxCard>
  );
}
