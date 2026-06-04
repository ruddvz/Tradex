import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Plus, RefreshCw } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { getToken } from '../lib/auth';
import { authUiEnabled } from '../lib/featureFlags';
import {
  closePaperPosition,
  createPaperOrder,
  listPaperFills,
  listPaperOrders,
  listPaperPositions,
  type PaperFillRow,
  type PaperOrderRow,
  type PaperPositionRow,
} from '../lib/api/paper';
import { clsx } from 'clsx';
import { StrategyRunsPanel } from '../components/paper/StrategyRunsPanel';

type Tab = 'overview' | 'orders' | 'positions';

const PAPER_WARNING =
  'Paper mode — orders are simulated. Real spreads, fills, slippage, liquidity, and broker rules can change outcomes.';

export function PaperTrading() {
  const navigate = useNavigate();
  const {
    paperAccounts,
    createPaperAccount,
    refreshPaperAccountsFromApi,
    refreshTradesFromApi,
    dataMode,
  } = useStore();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeAccountId = selectedId ?? paperAccounts[0]?.id ?? null;
  const [orders, setOrders] = useState<PaperOrderRow[]>([]);
  const [positions, setPositions] = useState<PaperPositionRow[]>([]);
  const [fills, setFills] = useState<PaperFillRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingBook, setLoadingBook] = useState(false);

  const [symbol, setSymbol] = useState('EURUSD');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [lotSize, setLotSize] = useState('0.1');
  const [refPrice, setRefPrice] = useState('1.085');
  const [stopLoss, setStopLoss] = useState('1.08');
  const [exitPrice, setExitPrice] = useState('1.09');

  const token = getToken();
  const selected = paperAccounts.find((a) => a.id === activeAccountId) ?? null;

  const loadBook = useCallback(async () => {
    if (!token || !selected) return;
    setLoadingBook(true);
    setLoadError(null);
    try {
      const [o, p, f] = await Promise.all([
        listPaperOrders(selected.id),
        listPaperPositions(selected.id, 'open'),
        listPaperFills(selected.id),
      ]);
      setOrders(o);
      setPositions(p);
      setFills(f);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load paper book');
    } finally {
      setLoadingBook(false);
    }
  }, [token, selected]);

  useEffect(() => {
    if (!activeAccountId || !token) return;
    const id = window.setTimeout(() => {
      void loadBook();
    }, 0);
    return () => window.clearTimeout(id);
  }, [activeAccountId, token, loadBook]);

  const onCreate = async () => {
    if (!token) {
      showToast(authUiEnabled ? 'Sign in to create a paper account.' : 'Save an API session token first.');
      return;
    }
    setBusy(true);
    try {
      const ok = await createPaperAccount({
        name: `Practice ${paperAccounts.length + 1}`,
      });
      if (ok) {
        showToast('Paper account created');
        await refreshPaperAccountsFromApi();
      } else showToast('Could not create account — check API logs');
    } finally {
      setBusy(false);
    }
  };

  const onSubmitOrder = async () => {
    if (!selected || !token) return;
    setBusy(true);
    try {
      const res = await createPaperOrder({
        paper_account_id: selected.id,
        symbol: symbol.trim().toUpperCase(),
        side,
        lot_size: parseFloat(lotSize),
        reference_price: parseFloat(refPrice),
        stop_loss: parseFloat(stopLoss),
      });
      if (res.error) showToast(res.error, 'warning');
      else if (res.order?.status === 'rejected' && res.order.rejection_reason) {
        showToast(res.order.rejection_reason, 'warning');
      } else showToast(res.position ? 'Order filled — position opened' : 'Order recorded');
      await loadBook();
      await refreshPaperAccountsFromApi();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Order failed');
    } finally {
      setBusy(false);
    }
  };

  const onClosePosition = async (positionId: string) => {
    setBusy(true);
    try {
      await closePaperPosition(positionId, parseFloat(exitPrice));
      showToast('Position closed — journal trade created with source=paper');
      await loadBook();
      await refreshPaperAccountsFromApi();
      if (dataMode === 'live') await refreshTradesFromApi();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Close failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Paper trading"
        subtitle="Simulated orders and fills — no live execution"
        showDateRange={false}
      />

      <div className="page-shell px-5 py-6 space-y-6">
        <div className="rounded-xl border border-analytics/25 bg-analytics/5 px-4 py-3 text-xs text-text-secondary">
          {PAPER_WARNING}
        </div>

        {!token && (
          <div className="card p-5 border border-amber-500/25 bg-amber-500/5">
            <p className="text-sm text-text-secondary">
              {authUiEnabled ? (
                <>
                  <button
                    type="button"
                    className="text-analytics font-semibold hover:underline"
                    onClick={() => navigate('/auth')}
                  >
                    Sign in
                  </button>{' '}
                  to use paper accounts on the API.
                </>
              ) : (
                'Enable auth UI or set a Bearer token session to use paper accounts with the API.'
              )}
            </p>
          </div>
        )}

        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-analytics/15 border border-analytics/25">
                <Landmark className="w-6 h-6 text-analytics" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Accounts</h2>
                <p className="text-sm text-text-muted mt-0.5">
                  Market orders with spread, slippage, and commission simulation.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={busy || !token}
              onClick={() => void onCreate()}
              className="btn-primary self-start sm:self-center inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New account
            </button>
          </div>

          {paperAccounts.length === 0 ? (
            <EmptyState
              title="Paper mode not configured"
              body="Create a paper account to test strategies without risking real money."
              actions={
                token ? (
                  <button type="button" className="btn-primary text-sm" disabled={busy} onClick={() => void onCreate()}>
                    Create paper account
                  </button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {paperAccounts.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedId(a.id)}
                    className={clsx(
                      'rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                      selected?.id === a.id
                        ? 'border-analytics/40 bg-analytics/10'
                        : 'border-surface-border bg-surface/40 hover:border-analytics/20'
                    )}
                  >
                    <span className="font-medium text-text-primary">{a.name}</span>
                    <span className="block text-xs text-text-muted mt-0.5">
                      {(a.balance ?? a.startingBalance).toLocaleString()} {a.currency}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-1 border-b border-surface-border mb-4">
                {(['overview', 'orders', 'positions'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={clsx(
                      'px-3 py-2 text-xs font-semibold capitalize border-b-2 -mb-px',
                      tab === t ? 'border-analytics text-analytics' : 'border-transparent text-text-muted'
                    )}
                  >
                    {t}
                  </button>
                ))}
                <button
                  type="button"
                  className="ml-auto text-xs text-analytics hover:underline self-center"
                  onClick={() => void loadBook()}
                  disabled={loadingBook}
                >
                  <RefreshCw className={clsx('inline w-3 h-3 mr-1', loadingBook && 'animate-spin')} />
                  Refresh
                </button>
              </div>

              {loadError && <ErrorState message={loadError} onRetry={() => void loadBook()} className="mb-4" />}
              {loadingBook && !loadError && <LoadingState label="Loading orders and positions…" />}

              {!loadingBook && tab === 'overview' && selected && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-text-primary">New market order</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-text-muted col-span-2">
                        Symbol
                        <input className="input mt-1 w-full" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
                      </label>
                      <label className="text-xs text-text-muted">
                        Side
                        <select className="select mt-1 w-full" value={side} onChange={(e) => setSide(e.target.value as 'buy' | 'sell')}>
                          <option value="buy">Buy</option>
                          <option value="sell">Sell</option>
                        </select>
                      </label>
                      <label className="text-xs text-text-muted">
                        Lots
                        <input className="input mt-1 w-full" value={lotSize} onChange={(e) => setLotSize(e.target.value)} />
                      </label>
                      <label className="text-xs text-text-muted">
                        Reference price
                        <input className="input mt-1 w-full" value={refPrice} onChange={(e) => setRefPrice(e.target.value)} />
                      </label>
                      <label className="text-xs text-text-muted">
                        Stop loss (required)
                        <input className="input mt-1 w-full" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} />
                      </label>
                    </div>
                    <button type="button" className="btn-primary w-full" disabled={busy} onClick={() => void onSubmitOrder()}>
                      Submit paper order
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-text-muted">
                      Open positions: <span className="text-text-primary font-medium">{positions.length}</span>
                    </p>
                    <p className="text-text-muted">
                      Recent fills: <span className="text-text-primary font-medium">{fills.length}</span>
                    </p>
                    <p className="text-xs text-text-muted">
                      Closing a position creates a journal trade with <code className="text-analytics">source=paper</code>.
                    </p>
                  </div>
                </div>
              )}

              {!loadingBook && tab === 'orders' && (
                <ul className="space-y-2">
                  {orders.length === 0 ? (
                    <p className="text-sm text-text-muted">No orders yet.</p>
                  ) : (
                    orders.map((o) => (
                      <li
                        key={o.id}
                        className={clsx(
                          'rounded-lg border px-3 py-2 text-sm',
                          o.status === 'rejected'
                            ? 'border-loss/30 bg-loss/5'
                            : 'border-surface-border'
                        )}
                      >
                        <div className="flex justify-between gap-2">
                          <span>
                            {o.symbol} {o.side.toUpperCase()} · {o.lot_size} lot
                          </span>
                          <span
                            className={clsx(
                              'text-xs font-semibold uppercase shrink-0',
                              o.status === 'rejected' ? 'text-loss' : 'text-analytics'
                            )}
                          >
                            {o.status}
                          </span>
                        </div>
                        {o.rejection_reason && (
                          <p className="text-xs text-loss mt-1 leading-relaxed">{o.rejection_reason}</p>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              )}

              {!loadingBook && tab === 'positions' && (
                <div className="space-y-3">
                  <label className="text-xs text-text-muted block max-w-xs">
                    Exit price for close
                    <input className="input mt-1 w-full" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} />
                  </label>
                  <ul className="space-y-2">
                    {positions.length === 0 ? (
                      <p className="text-sm text-text-muted">No open positions.</p>
                    ) : (
                      positions.map((p) => (
                        <li key={p.id} className="rounded-lg border border-analytics/25 bg-analytics/5 px-3 py-3 text-sm">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium">
                              {p.symbol} {p.side.toUpperCase()} @ {p.avg_entry_price}
                            </span>
                            <span className="text-text-muted">{p.lot_size} lot</span>
                          </div>
                          <button
                            type="button"
                            className="btn-secondary text-xs mt-2"
                            disabled={busy}
                            onClick={() => void onClosePosition(p.id)}
                          >
                            Close position
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
        <StrategyRunsPanel paperAccountId={activeAccountId} />
      </div>
    </div>
  );
}
