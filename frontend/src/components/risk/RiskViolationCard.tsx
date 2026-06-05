import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TxCard } from '../ui/TxCard';
import { TxEmptyState } from '../ui/TxEmptyState';
import { TxLoadingState } from '../ui/TxLoadingState';
import type { PaperViolationRow } from '../../lib/api/risk';
import { clsx } from 'clsx';

function SeverityDot({ severity }: { severity: string }) {
  const color =
    severity === 'critical' || severity === 'danger'
      ? 'bg-[var(--tx-loss)]'
      : severity === 'warning'
        ? 'bg-[var(--tx-warning)]'
        : 'bg-[var(--tx-text-4)]';
  return <span className={clsx('inline-block h-2 w-2 shrink-0 rounded-full', color)} aria-hidden />;
}

export function RiskViolationCard({
  violations,
  loading,
}: {
  violations: PaperViolationRow[] | null;
  loading?: boolean;
}) {
  return (
    <TxCard title="Recent violations" subtitle="Paper risk breaches and blocked orders">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-[var(--tx-warning)]" aria-hidden />
      </div>
      {loading || violations === null ? (
        <TxLoadingState label="Loading violations…" />
      ) : violations.length === 0 ? (
        <>
          <TxEmptyState
            title="No violations yet"
            description="Rejected paper orders and risk breaches appear here."
          />
          <Link
            to="/paper-trading"
            className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-[var(--tx-info)]"
          >
            Open Paper Bot →
          </Link>
        </>
      ) : (
        <ul className="divide-y divide-[var(--tx-line-1)]">
          {violations.map((v) => (
            <li key={v.id} className="flex gap-3 py-3">
              <SeverityDot severity={v.severity} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--tx-text-1)]">
                  {v.violation_type.replace(/_/g, ' ')}
                </p>
                <p className="mt-0.5 text-xs text-[var(--tx-text-3)]">{v.reason}</p>
                {v.created_at && (
                  <p className="mt-1 text-[10px] text-[var(--tx-text-4)]">
                    {format(parseISO(v.created_at), 'MMM d, yyyy HH:mm')}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </TxCard>
  );
}
