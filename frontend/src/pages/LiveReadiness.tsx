import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Shield, XCircle } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { ModeBadge } from '../components/status/ModeBadge';
import { resolveAppMode } from '../lib/resolveAppMode';
import { useStore } from '../store/useStore';
import { getToken } from '../lib/auth';
import { fetchLiveReadiness, type LiveReadinessReport } from '../lib/api/liveReadiness';
import { clsx } from 'clsx';

export function LiveReadiness() {
  const { dataMode, paperModeActive } = useStore();
  const [report, setReport] = useState<LiveReadinessReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signedIn = Boolean(getToken());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!signedIn) {
        setReport(null);
        return;
      }
      try {
        const data = await fetchLiveReadiness();
        if (!cancelled) {
          setReport(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load checklist');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  return (
    <div className="min-h-screen">
      <Header
        title="Live readiness"
        subtitle="Checklist only — real-money execution is not enabled"
        showDateRange={false}
      />

      <div className="page-shell p-6 space-y-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <ModeBadge mode={resolveAppMode({ dataMode, paperModeActive })} />
          <span className="text-xs text-red-400 font-semibold uppercase tracking-wide">
            Live orders blocked
          </span>
        </div>

        <div className="card p-5 border border-red-500/20 bg-red-500/5">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <h2 className="font-semibold text-white">Live execution disabled</h2>
              <p className="text-sm text-slate-400 mt-1">
                Tradex routes automated orders to the paper simulator only. The broker adapter raises an error if live
                placement is attempted. Use this checklist to see what you should complete before live trading is even
                discussed.
              </p>
            </div>
          </div>
        </div>

        {!signedIn && (
          <p className="text-sm text-slate-500">Sign in to load your personalized readiness checklist.</p>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

        {report && (
          <>
            <div
              className={clsx(
                'card p-5 border',
                report.ready_for_review ? 'border-brand-500/30 bg-brand-500/5' : 'border-amber-500/30 bg-amber-500/5'
              )}
            >
              <div className="flex items-center gap-3">
                {report.ready_for_review ? (
                  <CheckCircle2 className="w-6 h-6 text-brand-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                )}
                <div>
                  <p className="font-semibold text-white">
                    {report.ready_for_review
                      ? 'Required checklist items complete (review only)'
                      : 'Not ready for live review'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {report.passed_required} / {report.total_required} required items · live_execution_enabled:{' '}
                    {String(report.live_execution_enabled)}
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {report.items.map((item) => (
                <li
                  key={item.id}
                  className={clsx(
                    'card p-4 flex gap-3 border',
                    item.passed ? 'border-emerald-500/20' : 'border-surface-border'
                  )}
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{item.label}</span>
                      {item.required && (
                        <span className="text-[9px] uppercase tracking-wide text-amber-400 font-bold">Required</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-xs text-slate-500 leading-relaxed">{report.disclaimer}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{report.paper_vs_backtest_hint}</p>
          </>
        )}
      </div>
    </div>
  );
}
