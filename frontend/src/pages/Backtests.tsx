import { useCallback, useState } from 'react';
import {
  AlertTriangle,
  FlaskConical,
  LineChart,
  Loader2,
  Play,
  Trash2,
} from 'lucide-react';
import {
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Header } from '../components/layout/Header';
import { DataModeBadge } from '../components/ui/DataModeBadge';
import { DataSourceBadge } from '../components/status/DataSourceBadge';
import { useToast } from '../components/ui/Toast';
import { Badge } from '../components/ui/Badge';
import { getToken } from '../lib/auth';
import {
  createBacktest,
  deleteBacktest,
  fetchBacktestDetail,
  fetchBacktestEquity,
  fetchBacktests,
  type BacktestDetail,
  type BacktestSummary,
} from '../lib/api/backtests';
import { clsx } from 'clsx';

const TRUST_WARNINGS = [
  'Backtests are estimates, not guarantees.',
  'Live fills can be worse than simulated fills.',
  'Spread, slippage, commissions, and execution delays can change results.',
  'Do not enable live trading from a backtest alone.',
];

export function Backtests() {
  const { showToast } = useToast();
  const signedIn = Boolean(getToken());
  const [list, setList] = useState<BacktestSummary[]>([]);
  const [selected, setSelected] = useState<BacktestDetail | null>(null);
  const [equity, setEquity] = useState<{ date: string; equity: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [name, setName] = useState('Breakout MVP');
  const [symbol, setSymbol] = useState('EURUSD');

  const loadList = useCallback(async () => {
    if (!signedIn) return;
    setLoading(true);
    try {
      setList(await fetchBacktests());
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not load backtests');
    } finally {
      setLoading(false);
    }
  }, [signedIn, showToast]);

  const openDetail = async (id: string) => {
    try {
      const detail = await fetchBacktestDetail(id);
      const curve = await fetchBacktestEquity(id);
      setSelected(detail);
      setEquity(curve);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not load backtest');
    }
  };

  const runBacktest = async () => {
    if (!signedIn) {
      showToast('Sign in to run backtests');
      return;
    }
    setRunning(true);
    try {
      const detail = await createBacktest({ name: name.trim() || 'Backtest', symbol });
      showToast(`Backtest complete — ${detail.metrics?.trade_count ?? 0} trades`);
      setSelected(detail);
      const curve = await fetchBacktestEquity(detail.id);
      setEquity(curve);
      await loadList();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Backtest failed');
    } finally {
      setRunning(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteBacktest(id);
      if (selected?.id === id) setSelected(null);
      await loadList();
      showToast('Backtest deleted');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Backtests"
        subtitle="Test strategies on synthetic OHLC data before paper trading"
        showDateRange={false}
      />

      <div className="page-shell p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <DataModeBadge mode="backtest" showDescription />
          <DataSourceBadge source="backtest" />
          <Badge variant="warn" size="xs">
            Synthetic candles — not live market data
          </Badge>
        </div>

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <ul className="text-xs text-amber-100/90 space-y-1 list-disc list-inside">
              {(selected?.trust_warnings ?? TRUST_WARNINGS).map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        {!signedIn && (
          <p className="text-sm text-slate-400">
            Sign in to save and review backtest runs. Demo mode shows trust warnings only.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-5 space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-brand-400" />
              <h2 className="font-semibold text-white">New backtest</h2>
            </div>
            <div>
              <label className="label">Name</label>
              <input
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!signedIn}
              />
            </div>
            <div>
              <label className="label">Symbol</label>
              <select
                className="input w-full"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                disabled={!signedIn}
              >
                <option value="EURUSD">EURUSD</option>
                <option value="XAUUSD">XAUUSD</option>
                <option value="US30">US30</option>
              </select>
            </div>
            <p className="text-xs text-slate-500">
              Long breakout on prior 12-bar high, 2R target, 15 pip stop. Spread 1.2 / slip 0.5 pips.
            </p>
            <button
              type="button"
              className="btn-primary w-full justify-center"
              disabled={!signedIn || running}
              onClick={() => void runBacktest()}
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Running…
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Run backtest
                </>
              )}
            </button>
            {signedIn && (
              <button type="button" className="btn-secondary w-full text-sm" onClick={() => void loadList()}>
                Refresh list
              </button>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <div className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {selected.symbol} · {selected.data_label} · {selected.trade_count ?? selected.metrics?.trade_count ?? 0}{' '}
                        trades
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-danger text-xs"
                      onClick={() => void remove(selected.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Net P&L', value: `$${(selected.metrics?.net_pnl ?? 0).toLocaleString()}` },
                      { label: 'Return', value: `${selected.metrics?.return_pct ?? 0}%` },
                      { label: 'Max DD', value: `${selected.metrics?.max_drawdown_pct ?? 0}%` },
                      { label: 'Win rate', value: `${selected.metrics?.win_rate ?? 0}%` },
                      { label: 'Profit factor', value: `${selected.metrics?.profit_factor ?? 0}` },
                      { label: 'Expectancy', value: `$${selected.metrics?.expectancy ?? 0}` },
                      { label: 'Avg win', value: `$${selected.metrics?.avg_win ?? 0}` },
                      { label: 'Losing streak', value: `${selected.metrics?.longest_losing_streak ?? 0}` },
                    ].map((m) => (
                      <div key={m.label} className="bg-dark-300 rounded-lg p-3 text-center">
                        <div className="text-sm font-bold text-white">{m.value}</div>
                        <div className="text-[10px] text-slate-500">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <LineChart className="w-4 h-4 text-brand-400" />
                    <h3 className="font-semibold text-white">Equity curve</h3>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={equity}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: 8,
                          }}
                        />
                        <Line type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} dot={false} />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="card p-8 text-center text-slate-500 text-sm">
                Run a backtest or select a saved run to view metrics and equity curve.
              </div>
            )}

            {signedIn && (
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-3">Saved runs</h3>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                ) : list.length === 0 ? (
                  <p className="text-xs text-slate-500">No backtests yet.</p>
                ) : (
                  <div className="space-y-2">
                    {list.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => void openDetail(b.id)}
                        className={clsx(
                          'w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors',
                          selected?.id === b.id
                            ? 'border-brand-500/40 bg-brand-500/10'
                            : 'border-surface-border bg-dark-300 hover:bg-surface-light'
                        )}
                      >
                        <div>
                          <div className="text-sm font-medium text-white">{b.name}</div>
                          <div className="text-xs text-slate-500">{b.symbol}</div>
                        </div>
                        <div className="text-right">
                          <div
                            className={clsx(
                              'text-sm font-bold',
                              (b.net_pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                            )}
                          >
                            ${(b.net_pnl ?? 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500">{b.trade_count ?? 0} trades</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
