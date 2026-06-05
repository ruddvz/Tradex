import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { ModeHeaderStrip } from '../components/layout/ModeHeaderStrip';
import { BotSafetyCard } from '../components/bot/BotSafetyCard';
import { TxPage } from '../components/ui/TxPage';
import { TxCard } from '../components/ui/TxCard';
import { TxButton } from '../components/ui/TxButton';
import { TxTabs } from '../components/ui/TxTabs';
import { TxEmptyState } from '../components/ui/TxEmptyState';
import { TxErrorState } from '../components/ui/TxErrorState';
import { TxLoadingState } from '../components/ui/TxLoadingState';
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
import { StrategyRunsPanel } from '../components/paper/StrategyRunsPanel';
import { PaperAccountSwitcher } from '../components/paper/PaperAccountSwitcher';
import { PaperHeroCard } from '../components/paper/PaperHeroCard';
import { PaperOrderTicket } from '../components/paper/PaperOrderTicket';
import { PaperOrdersCard } from '../components/paper/PaperOrdersCard';
import { PaperPositionsCard } from '../components/paper/PaperPositionsCard';
import { PaperRejectedCard } from '../components/paper/PaperRejectedCard';
import { PaperAssumptionsCard } from '../components/paper/PaperAssumptionsCard';
import { ExecutionLogCard } from '../components/paper/ExecutionLogCard';
import { DataModeBadge } from '../components/ui/DataModeBadge';

type Tab = 'overview' | 'orders' | 'positions' | 'rejected';

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

  const estimatedRisk = useMemo(() => {
    const lots = parseFloat(lotSize);
    const ref = parseFloat(refPrice);
    const sl = parseFloat(stopLoss);
    if (!Number.isFinite(lots) || !Number.isFinite(ref) || !Number.isFinite(sl)) return undefined;
    const pts = Math.abs(ref - sl) * 10000;
    return `~$${(pts * lots * 10).toFixed(0)} at reference price (estimate)`;
  }, [lotSize, refPrice, stopLoss]);

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
    const id = window.setTimeout(() => void loadBook(), 0);
    return () => window.clearTimeout(id);
  }, [activeAccountId, token, loadBook]);

  const onCreate = async () => {
    if (!token) {
      showToast(authUiEnabled ? 'Sign in to create a paper account.' : 'Save an API session token first.');
      return;
    }
    setBusy(true);
    try {
      const ok = await createPaperAccount({ name: `Practice ${paperAccounts.length + 1}` });
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
      <Header title="Paper Bot" subtitle="Simulated orders — no live execution" showDateRange={false} compact />
      <ModeHeaderStrip />

      <TxPage density="dashboard" className="space-y-6">
        <BotSafetyCard />
        <DataModeBadge mode="paper" showDescription />

        <p className="rounded-[var(--tx-r-20)] border border-[var(--tx-info)]/25 bg-[var(--tx-info-soft)] px-4 py-3 text-xs text-[var(--tx-text-2)]">
          {PAPER_WARNING}
        </p>

        {!token && (
          <TxCard variant="warning">
            <p className="text-sm text-[var(--tx-text-2)]">
              {authUiEnabled ? (
                <>
                  <button
                    type="button"
                    className="font-semibold text-[var(--tx-info)]"
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
          </TxCard>
        )}

        <TxCard
          title="Paper accounts"
          action={
            <TxButton variant="primary" size="md" disabled={busy || !token} onClick={() => void onCreate()}>
              <Plus className="h-4 w-4" />
              New account
            </TxButton>
          }
        >
          {paperAccounts.length === 0 ? (
            <TxEmptyState
              title="Paper mode not configured"
              description="Create a paper account to test strategies without risking real money."
              actionLabel={token ? 'Create paper account' : undefined}
              onAction={token ? () => void onCreate() : undefined}
            />
          ) : (
            <>
              <PaperAccountSwitcher
                accounts={paperAccounts}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <TxTabs
                  items={[
                    { id: 'overview', label: 'Overview' },
                    { id: 'orders', label: 'Orders' },
                    { id: 'positions', label: 'Positions' },
                    { id: 'rejected', label: 'Rejected' },
                  ]}
                  value={tab}
                  onChange={(id) => setTab(id as Tab)}
                />
                <TxButton variant="ghost" size="sm" disabled={loadingBook} onClick={() => void loadBook()}>
                  Refresh
                </TxButton>
              </div>
            </>
          )}
        </TxCard>

        {loadError && <TxErrorState description={loadError} onRetry={() => void loadBook()} />}
        {loadingBook && !loadError && <TxLoadingState label="Loading orders and positions…" />}

        {!loadingBook && selected && tab === 'overview' && (
          <div className="space-y-6">
            <PaperHeroCard account={selected} openPositions={positions.length} recentFills={fills.length} />
            <PaperOrderTicket
              symbol={symbol}
              side={side}
              lotSize={lotSize}
              refPrice={refPrice}
              stopLoss={stopLoss}
              busy={busy}
              estimatedRisk={estimatedRisk}
              onSymbolChange={setSymbol}
              onSideChange={setSide}
              onLotSizeChange={setLotSize}
              onRefPriceChange={setRefPrice}
              onStopLossChange={setStopLoss}
              onSubmit={() => void onSubmitOrder()}
            />
          </div>
        )}

        {!loadingBook && selected && tab === 'orders' && <PaperOrdersCard orders={orders} />}
        {!loadingBook && selected && tab === 'positions' && (
          <PaperPositionsCard
            positions={positions}
            exitPrice={exitPrice}
            busy={busy}
            onExitPriceChange={setExitPrice}
            onClose={(id) => void onClosePosition(id)}
          />
        )}
        {!loadingBook && selected && tab === 'rejected' && <PaperRejectedCard orders={orders} />}

        <ExecutionLogCard
          rows={orders.slice(0, 12).map((o) => ({
            time: o.created_at ? new Date(o.created_at).toLocaleString() : '—',
            message:
              o.status === 'rejected'
                ? `Rejected: ${o.rejection_reason ?? 'risk check failed'}`
                : `${o.side.toUpperCase()} ${o.symbol} — ${o.status}`,
            rejected: o.status === 'rejected',
          }))}
        />
        <PaperAssumptionsCard />
        <StrategyRunsPanel paperAccountId={activeAccountId} />
      </TxPage>
    </div>
  );
}
