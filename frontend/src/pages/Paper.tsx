import { useCallback, useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { useStore } from '../store/useStore';
import { getToken } from '../lib/auth';
import { listPaperAccounts, createPaperAccount, type PaperAccountRow } from '../lib/api/paper';
import { clsx } from 'clsx';

export function Paper() {
  const { dataMode } = useStore();
  const [accounts, setAccounts] = useState<PaperAccountRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!getToken()) {
      setAccounts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await listPaperAccounts();
      setAccounts(rows);
      setSelected((prev) => prev ?? rows[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load paper accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!getToken()) {
        if (!cancelled) setAccounts([]);
        return;
      }
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
      try {
        const rows = await listPaperAccounts();
        if (!cancelled) {
          setAccounts(rows);
          setSelected((prev) => prev ?? rows[0]?.id ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load paper accounts');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const onCreate = async () => {
    if (!getToken()) return;
    setLoading(true);
    try {
      await createPaperAccount({
        name: `Paper ${accounts.length + 1}`,
        starting_balance: 50000,
        max_daily_loss: 500,
        max_risk_per_trade_percent: 1,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const selectedAcc = accounts.find((a) => a.id === selected);

  return (
    <div className="min-h-screen">
      <Header title="Paper" subtitle="Virtual balance and risk-gated simulated trades" showDateRange={false} />
      <div className="page-shell px-5 py-6 space-y-6">
        {dataMode === 'demo' && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Sign in to use paper accounts on the server. Demo mode below is read-only for this screen.
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-primary" disabled={loading || !getToken()} onClick={() => void onCreate()}>
            New paper account
          </button>
          {accounts.length > 0 && (
            <select
              className="select max-w-xs"
              value={selected ?? ''}
              onChange={(e) => setSelected(e.target.value || null)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedAcc && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-hover p-5">
              <div className="text-xs uppercase tracking-wide text-slate-500">Balance</div>
              <div className="text-2xl font-bold text-white">${selectedAcc.balance.toLocaleString()}</div>
            </div>
            <div className="card-hover p-5">
              <div className="text-xs uppercase tracking-wide text-slate-500">Equity</div>
              <div className="text-2xl font-bold text-brand-400">${selectedAcc.equity.toLocaleString()}</div>
            </div>
            <div className="card-hover p-5">
              <div className="text-xs uppercase tracking-wide text-slate-500">Daily loss cap</div>
              <div className="text-2xl font-bold text-slate-200">${selectedAcc.max_daily_loss.toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className={clsx('rounded-xl border border-surface-border bg-surface/60 p-5 text-sm text-slate-400')}>
          <p className="mb-2 text-white font-semibold">API</p>
          <p>
            Closed paper trades: <code className="text-brand-300">POST /api/v1/paper/trades</code> with{' '}
            <code className="text-brand-300">paper_account_id</code>, prices, lot size, and optional stop loss for risk
            checks. Oversized risk returns <code className="text-red-300">400</code> with a plain-language reason.
          </p>
        </div>
      </div>
    </div>
  );
}
