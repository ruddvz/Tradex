import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import { fetchRiskEvents, fetchPaperViolations, type AuditEventRow } from '../../lib/api/risk';
import { getToken } from '../../lib/auth';
import { LoadingState } from '../common/LoadingState';

export function RiskStatusCard() {
  const { dataMode, botStatus } = useStore();
  const [events, setEvents] = useState<AuditEventRow[] | null>(null);
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    if (dataMode !== 'live' || !getToken()) return;
    let cancelled = false;
    void Promise.all([fetchRiskEvents(5), fetchPaperViolations(5)])
      .then(([evts, vios]) => {
        if (!cancelled) {
          setEvents(evts);
          setViolationCount(vios.length);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvents([]);
          setViolationCount(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dataMode, botStatus?.kill_switch_active]);

  if (dataMode !== 'live') return null;

  const killed = botStatus?.kill_switch_active;

  return (
    <div
      className={clsx(
        'card p-4 border',
        killed ? 'border-loss/40 bg-loss/5' : 'border-surface-border bg-surface/40'
      )}
    >
      <div className="flex items-start gap-3">
        {killed ? (
          <ShieldAlert className="w-5 h-5 text-loss shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">
            {killed ? 'Kill switch active' : 'Risk engine'}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {killed
              ? 'New paper orders are blocked until you resume paper-only mode.'
              : 'Paper orders are checked against your risk profile before fill.'}
          </p>
          {events === null && <LoadingState label="Loading events…" className="py-4" />}
          {events !== null && events.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {events.slice(0, 3).map((e) => (
                <li key={e.id} className="text-xs text-text-secondary truncate" title={e.message}>
                  <span
                    className={clsx(
                      'font-semibold uppercase mr-1',
                      e.severity === 'critical' || e.severity === 'danger'
                        ? 'text-loss'
                        : 'text-text-muted'
                    )}
                  >
                    {e.event_type.replace(/_/g, ' ')}
                  </span>
                  {e.message}
                </li>
              ))}
            </ul>
          )}
          {(killed || violationCount > 0) && (
            <Link
              to="/risk"
              className="inline-flex mt-3 text-xs font-semibold text-analytics hover:underline"
            >
              Open Risk Center
              {violationCount > 0 ? ` (${violationCount} recent violations)` : ''}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
