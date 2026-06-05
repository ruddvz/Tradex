import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Octagon,
  Settings,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { DataModeBadge, RealExecutionDisabledNotice } from '../components/ui/DataModeBadge';
import { resolveDataViewMode } from '../lib/resolveDataViewMode';
import { useStore } from '../store/useStore';
import { getToken } from '../lib/auth';
import {
  fetchRiskProfiles,
  fetchPaperViolations,
  fetchRiskEvents,
  updateRiskProfile,
  type RiskProfileRow,
  type PaperViolationRow,
  type AuditEventRow,
} from '../lib/api/risk';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { clsx } from 'clsx';
import { format, parseISO } from 'date-fns';

function SeverityDot({ severity }: { severity: string }) {
  const color =
    severity === 'critical' || severity === 'danger'
      ? 'bg-loss'
      : severity === 'warning'
        ? 'bg-warn'
        : 'bg-text-muted';
  return <span className={clsx('inline-block w-2 h-2 rounded-full shrink-0', color)} />;
}

export function RiskCenter() {
  const { dataMode, paperModeActive, botStatus, triggerKillSwitch, resumePaperTrading } =
    useStore();
  const viewMode = resolveDataViewMode({ dataMode, paperModeActive });

  const [profile, setProfile] = useState<RiskProfileRow | null>(null);
  const [violations, setViolations] = useState<PaperViolationRow[] | null>(null);
  const [events, setEvents] = useState<AuditEventRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dataMode !== 'live' || !getToken()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void Promise.all([fetchRiskProfiles(), fetchPaperViolations(20), fetchRiskEvents(20)])
      .then(([profiles, vios, evts]) => {
        if (cancelled) return;
        setProfile(profiles[0] ?? null);
        setViolations(vios);
        setEvents(evts);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load risk data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dataMode, botStatus?.kill_switch_active]);

  const killed = botStatus?.kill_switch_active;

  const patchProfile = async (patch: Partial<RiskProfileRow>) => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateRiskProfile(profile.id, {
        max_risk_per_trade_percent: patch.max_risk_per_trade_percent,
        max_daily_loss_percent: patch.max_daily_loss_percent,
        max_open_positions: patch.max_open_positions,
        require_stop_loss: patch.require_stop_loss,
      });
      setProfile(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Risk Center" subtitle="Profiles, limits, violations, and kill switch" showDateRange={false} />

      <div className="page-shell p-6 space-y-6 pb-28 md:pb-6">
        <div className="flex flex-wrap items-start gap-3 justify-between">
          <DataModeBadge mode={viewMode} showDescription />
          <RealExecutionDisabledNotice className="max-w-md" />
        </div>

        {dataMode === 'demo' && (
          <EmptyState
            title="Sign in to manage risk"
            body="Risk profiles, paper violations, and kill switch require an authenticated account."
            actions={
              <Link to="/auth" className="btn-primary text-sm">
                Sign in
              </Link>
            }
          />
        )}

        {dataMode === 'live' && loading && <LoadingState label="Loading risk center…" />}

        {dataMode === 'live' && error && (
          <div className="rounded-xl border border-loss/30 bg-loss/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {dataMode === 'live' && !loading && (
          <>
            {/* Kill switch */}
            <section className="card p-5 border border-surface-border">
              <div className="flex flex-wrap items-start gap-4 justify-between">
                <div className="flex items-start gap-3">
                  {killed ? (
                    <ShieldAlert className="w-6 h-6 text-loss shrink-0" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-success shrink-0" />
                  )}
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">Kill switch</h2>
                    <p className="text-sm text-text-muted mt-1">
                      {killed
                        ? 'New paper orders are blocked. Resume when you are ready to simulate again.'
                        : 'Emergency stop for new paper orders. Live broker execution is not available.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={clsx('btn-secondary text-sm gap-2', killed && 'border-loss/40 text-loss')}
                  onClick={() => void (killed ? resumePaperTrading() : triggerKillSwitch())}
                >
                  <Octagon className="w-4 h-4" />
                  {killed ? 'Resume paper trading' : 'Activate kill switch'}
                </button>
              </div>
            </section>

            {/* Risk profile */}
            {profile ? (
              <section className="card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-analytics" />
                  <h2 className="text-base font-semibold text-text-primary">{profile.name}</h2>
                  <Link to="/settings" className="ml-auto text-xs text-analytics hover:underline flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5" />
                    Full settings
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: 'Max risk / trade',
                      value: profile.max_risk_per_trade_percent,
                      key: 'max_risk_per_trade_percent' as const,
                      suffix: '%',
                    },
                    {
                      label: 'Daily loss limit',
                      value: profile.max_daily_loss_percent,
                      key: 'max_daily_loss_percent' as const,
                      suffix: '%',
                    },
                    {
                      label: 'Max open positions',
                      value: profile.max_open_positions,
                      key: 'max_open_positions' as const,
                      suffix: '',
                    },
                    {
                      label: 'Require stop loss',
                      value: profile.require_stop_loss ? 1 : 0,
                      key: 'require_stop_loss' as const,
                      suffix: '',
                      bool: true,
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-surface-border bg-surface/30 p-3">
                      <p className="text-xs text-text-muted mb-1">{item.label}</p>
                      {item.bool ? (
                        <button
                          type="button"
                          disabled={saving}
                          className="text-sm font-semibold text-text-primary"
                          onClick={() =>
                            void patchProfile({ require_stop_loss: !profile.require_stop_loss })
                          }
                        >
                          {profile.require_stop_loss ? 'Required' : 'Optional'}
                        </button>
                      ) : (
                        <input
                          type="number"
                          className="input py-1.5 text-sm w-full"
                          defaultValue={item.value}
                          disabled={saving}
                          onBlur={(e) => {
                            const n = parseFloat(e.target.value);
                            if (!Number.isFinite(n)) return;
                            void patchProfile({ [item.key]: n });
                          }}
                        />
                      )}
                      {!item.bool && item.suffix && (
                        <span className="text-xs text-text-muted ml-1">{item.suffix}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <EmptyState
                title="No risk profile yet"
                body="A default profile is created on first login. Refresh or visit Settings."
              />
            )}

            {/* Violations */}
            <section className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-warn" />
                <h2 className="text-base font-semibold text-text-primary">Recent paper violations</h2>
              </div>
              {violations === null ? (
                <LoadingState label="Loading violations…" />
              ) : violations.length === 0 ? (
                <EmptyState
                  title="No violations yet"
                  body="Rejected paper orders and risk breaches appear here."
                  actions={
                    <Link to="/paper-trading" className="btn-secondary text-sm">
                      Open paper trading
                    </Link>
                  }
                />
              ) : (
                <ul className="divide-y divide-surface-border">
                  {violations.map((v) => (
                    <li key={v.id} className="py-3 flex gap-3 items-start">
                      <SeverityDot severity={v.severity} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary">{v.violation_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-text-muted mt-0.5">{v.reason}</p>
                        {v.created_at && (
                          <p className="text-[10px] text-text-muted mt-1">
                            {format(parseISO(v.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Audit events */}
            <section className="card p-5">
              <h2 className="text-base font-semibold text-text-primary mb-4">Manual override log</h2>
              {events === null ? (
                <LoadingState label="Loading events…" />
              ) : events.length === 0 ? (
                <p className="text-sm text-text-muted">No audit events recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {events.map((e) => (
                    <li
                      key={e.id}
                      className="text-xs text-text-secondary border-l-2 border-surface-border pl-3 py-1"
                    >
                      <span className="font-semibold uppercase text-text-muted mr-2">
                        {e.event_type.replace(/_/g, ' ')}
                      </span>
                      {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
