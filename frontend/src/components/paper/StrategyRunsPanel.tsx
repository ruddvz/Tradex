import { useCallback, useEffect, useState } from 'react';
import { Bot, Loader2, Pause, Play, Square, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../ui/Toast';
import { getToken } from '../../lib/auth';
import {
  createStrategy,
  fetchStrategies,
  fetchStrategyRunEvents,
  fetchStrategyRuns,
  pauseStrategyRun,
  startStrategyRun,
  stopStrategyRun,
  tickStrategyRun,
  type StrategyEventRow,
  type StrategyRow,
  type StrategyRunRow,
} from '../../lib/api/strategyRuns';

type Props = {
  paperAccountId: string | null;
};

export function StrategyRunsPanel({ paperAccountId }: Props) {
  const { showToast } = useToast();
  const token = getToken();
  const [strategies, setStrategies] = useState<StrategyRow[]>([]);
  const [runs, setRuns] = useState<StrategyRunRow[]>([]);
  const [events, setEvents] = useState<StrategyEventRow[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const [s, r] = await Promise.all([fetchStrategies(), fetchStrategyRuns()]);
    setStrategies(s);
    setRuns(r);
    const running = r.find((x) => x.status === 'running');
    if (running) {
      setActiveRunId(running.id);
      const ev = await fetchStrategyRunEvents(running.id);
      setEvents(ev);
    }
    if (s.length && !selectedStrategyId) setSelectedStrategyId(s[0].id);
  }, [token, selectedStrategyId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!token) return;
      try {
        await load();
      } catch (e) {
        if (!cancelled) showToast(e instanceof Error ? e.message : 'Could not load strategies');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, showToast, token, paperAccountId]);

  const ensureStrategy = async (): Promise<string | null> => {
    if (strategies.length > 0) return selectedStrategyId || strategies[0].id;
    const created = await createStrategy({
      name: 'Paper breakout',
      symbol: 'EURUSD',
      rules: { lot_size: 0.01, stop_pips: 15, rr_target: 2 },
    });
    setStrategies([created]);
    setSelectedStrategyId(created.id);
    return created.id;
  };

  const onStart = async () => {
    if (!paperAccountId || !token) {
      showToast('Select a paper account first');
      return;
    }
    setBusy(true);
    try {
      const sid = await ensureStrategy();
      if (!sid) return;
      const run = await startStrategyRun({
        strategy_id: sid,
        paper_account_id: paperAccountId,
      });
      setActiveRunId(run.id);
      showToast('Strategy run started (paper only)');
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Start failed');
    } finally {
      setBusy(false);
    }
  };

  const onTick = async () => {
    if (!activeRunId) return;
    setBusy(true);
    try {
      const res = await tickStrategyRun(activeRunId);
      showToast(`Tick: ${String(res.action)}`);
      const ev = await fetchStrategyRunEvents(activeRunId);
      setEvents(ev);
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Tick failed');
    } finally {
      setBusy(false);
    }
  };

  const onPause = async () => {
    if (!activeRunId) return;
    setBusy(true);
    try {
      await pauseStrategyRun(activeRunId);
      showToast('Run paused');
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Pause failed');
    } finally {
      setBusy(false);
    }
  };

  const onStop = async () => {
    if (!activeRunId) return;
    setBusy(true);
    try {
      await stopStrategyRun(activeRunId);
      setActiveRunId(null);
      showToast('Run stopped');
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Stop failed');
    } finally {
      setBusy(false);
    }
  };

  const activeRun =
    runs.find((r) => r.id === activeRunId) ?? runs.find((r) => r.status === 'running');

  if (!token) {
    return (
      <div className="card p-5 text-sm text-text-muted">
        Sign in to run strategies in paper mode. All orders pass through the risk engine.
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/25">
          <Bot className="w-5 h-5 text-purple-300" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Strategy runner</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Paper mode only — manual tick places market orders through risk checks. Live execution
            remains disabled.
          </p>
        </div>
      </div>

      {strategies.length > 0 && (
        <div>
          <label className="label">Strategy</label>
          <select
            className="input w-full max-w-md"
            value={selectedStrategyId}
            onChange={(e) => setSelectedStrategyId(e.target.value)}
            disabled={Boolean(activeRun && activeRun.status === 'running')}
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.symbol})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary text-sm"
          disabled={busy || !paperAccountId}
          onClick={() => void onStart()}
        >
          <Play className="w-4 h-4" /> Start
        </button>
        <button
          type="button"
          className="btn-secondary text-sm"
          disabled={busy || !activeRun || activeRun.status !== 'running'}
          onClick={() => void onTick()}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Tick
        </button>
        <button
          type="button"
          className="btn-secondary text-sm"
          disabled={busy || !activeRun || activeRun.status !== 'running'}
          onClick={() => void onPause()}
        >
          <Pause className="w-4 h-4" /> Pause
        </button>
        <button
          type="button"
          className="btn-danger text-sm"
          disabled={busy || !activeRun}
          onClick={() => void onStop()}
        >
          <Square className="w-4 h-4" /> Stop
        </button>
      </div>

      {activeRun && (
        <div className="rounded-lg border border-surface-border bg-dark-300/50 px-3 py-2 text-xs text-slate-400">
          Status:{' '}
          <span
            className={clsx(
              'font-semibold',
              activeRun.status === 'running' ? 'text-emerald-400' : 'text-amber-400'
            )}
          >
            {activeRun.status}
          </span>
          {' · '}
          Ticks: {activeRun.summary?.ticks ?? 0} · Filled: {activeRun.summary?.orders_filled ?? 0} ·
          Rejected: {activeRun.summary?.orders_rejected ?? 0}
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Run events
        </h3>
        {events.length === 0 ? (
          <p className="text-xs text-slate-500">
            No events yet — start a run and tick to generate audit log entries.
          </p>
        ) : (
          <ul className="space-y-1.5 max-h-40 overflow-y-auto">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="text-xs text-slate-400 border-l-2 border-surface-border pl-2"
              >
                <span className="text-slate-500">{ev.event_type}</span> — {ev.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
