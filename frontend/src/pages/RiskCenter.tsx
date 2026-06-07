import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { ModeHeaderStrip } from '../components/layout/ModeHeaderStrip';
import {
  RiskStatusHero,
  DailyLossProgress,
  OpenExposureCard,
} from '../components/risk/RiskStatusHero';
import { KillSwitchCard } from '../components/risk/KillSwitchCard';
import { RiskLimitsCard } from '../components/risk/RiskLimitsCard';
import { RiskViolationCard } from '../components/risk/RiskViolationCard';
import { RiskEventTimeline } from '../components/risk/RiskEventTimeline';
import { TxPage } from '../components/ui/TxPage';
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
import { TxEmptyState } from '../components/ui/TxEmptyState';
import { TxErrorState } from '../components/ui/TxErrorState';
import { TxLoadingState } from '../components/ui/TxLoadingState';
export function RiskCenter() {
  const { dataMode, paperModeActive, botStatus, triggerKillSwitch, resumePaperTrading } = useStore();
  const viewMode = resolveDataViewMode({ dataMode, paperModeActive });
  const isLiveSession = dataMode === 'live' && Boolean(getToken());
  const [profile, setProfile] = useState<RiskProfileRow | null>(null);
  const [violations, setViolations] = useState<PaperViolationRow[] | null>(null);
  const [events, setEvents] = useState<AuditEventRow[] | null>(null);
  const [fetchDone, setFetchDone] = useState(!isLiveSession);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const killed = botStatus?.kill_switch_active;

  useEffect(() => {
    if (!isLiveSession) return;
    let cancelled = false;
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
        if (!cancelled) setFetchDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isLiveSession, killed]);

  const loading = isLiveSession && !fetchDone;

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
      <Header title="Risk" subtitle="Profiles, limits, violations, and kill switch" showDateRange={false} compact />
      <ModeHeaderStrip />

      <TxPage density="dashboard" className="space-y-6 pb-28 md:pb-6">
        <RiskStatusHero
          state={
            killed ? 'locked' : dataMode === 'demo' ? 'blocked' : profile && (profile.max_daily_loss_percent ?? 3) < 1 ? 'slow' : 'safe'
          }
        />
        <DailyLossProgress usedPct={1.2} limitPct={profile?.max_daily_loss_percent ?? 3} />
        <OpenExposureCard exposure={0} openTrades={0} />

        <div className="flex flex-wrap items-start gap-3 justify-between">
          <DataModeBadge mode={viewMode} showDescription />
          <RealExecutionDisabledNotice className="max-w-md" />
        </div>

        {dataMode === 'demo' && (
          <TxEmptyState
            title="Sign in to manage risk"
            description="Risk profiles, paper violations, and kill switch require an authenticated account."
            actionLabel="Sign in"
            onAction={() => {
              window.location.href = '/auth';
            }}
          />
        )}

        {dataMode === 'live' && loading && <TxLoadingState label="Loading risk center…" variant="page" />}

        {dataMode === 'live' && error && (
          <TxErrorState description={error} onRetry={() => window.location.reload()} />
        )}

        {dataMode === 'live' && !loading && (
          <>
            <KillSwitchCard
              active={Boolean(killed)}
              onToggle={() => void (killed ? resumePaperTrading() : triggerKillSwitch())}
            />
            {profile ? (
              <RiskLimitsCard profile={profile} saving={saving} onPatch={(p) => void patchProfile(p)} />
            ) : (
              <TxEmptyState
                title="No risk profile yet"
                description="A default profile is created on first login."
                actionLabel="Open settings"
                onAction={() => {
                  window.location.href = '/settings';
                }}
              />
            )}
            <RiskViolationCard violations={violations} />
            <RiskEventTimeline events={events} />
            <Link
              to="/paper-trading"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--tx-r-pill)] border border-[var(--tx-line-2)] bg-[var(--tx-surface-2)] px-4 text-sm font-semibold text-[var(--tx-text-1)] hover:bg-[var(--tx-surface-3)]"
            >
              Open Paper Bot
            </Link>
          </>
        )}
      </TxPage>
    </div>
  );
}
