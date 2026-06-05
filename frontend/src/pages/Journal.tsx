import { useState, useMemo } from 'react';
import { Download, Plus, Clock, BarChart3 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { AddTradeModal } from '../components/journal/AddTradeModal';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import type { Trade } from '../types';
import { TxMetric } from '../components/ui/TxMetric';
import { EmptyState } from '../components/common/EmptyState';
import { DataSourceBadge } from '../components/status/DataSourceBadge';
import { ModeHeaderStrip } from '../components/layout/ModeHeaderStrip';
import { BottomActionBar } from '../components/layout/BottomActionBar';
import { TxPage } from '../components/ui/TxPage';
import { TxButton } from '../components/ui/TxButton';
import { TxSearchField } from '../components/ui/TxSearchField';
import { PageToolbar } from '../components/layout/PageToolbar';
import {
  TradeFilterSheet,
  type JournalFilterState,
} from '../components/journal/TradeFilterSheet';
import { JournalTradeCard } from '../components/journal/JournalTradeCard';
import { TradeDrawer } from '../components/journal/TradeDrawer';
import { JournalFilterBar } from '../components/journal/JournalFilterBar';
import { TxCard } from '../components/ui/TxCard';


export function Journal() {
  const { trades, dataMode } = useStore();
  const [search, setSearch] = useState('');
  const [symbolFilter, setSymbolFilter] = useState<string>('all');
  const [dirFilter, setDirFilter] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [outFilter, setOutFilter] = useState<'all' | 'WIN' | 'LOSS' | 'BREAKEVEN'>('all');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'A'>('all');
  const [sourceFilter, setSourceFilter] = useState<
    'all' | 'manual' | 'mt5' | 'paper' | 'backtest' | 'demo'
  >('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [addTradeOpen, setAddTradeOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const symbols = useMemo(() => Array.from(new Set(trades.map((t) => t.symbol))).sort(), [trades]);
  const strategies = useMemo(
    () => Array.from(new Set(trades.map((t) => t.strategy).filter(Boolean))).sort(),
    [trades]
  );
  const sheetFilters: JournalFilterState = {
    status: outFilter === 'all' ? 'all' : outFilter === 'WIN' ? 'WIN' : 'LOSS',
    symbol: symbolFilter === 'all' ? '' : symbolFilter,
    strategy: '',
    session: '',
  };

  const symbolCounts = useMemo(() => {
    const m = new Map<string, number>();
    trades.forEach((t) => m.set(t.symbol, (m.get(t.symbol) ?? 0) + 1));
    return m;
  }, [trades]);

  const filtered = useMemo(
    () =>
      trades.filter((t) => {
        const q = search.toLowerCase();
        const matchSearch =
          !search ||
          t.symbol.toLowerCase().includes(q) ||
          t.strategy.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q);
        if (!matchSearch) return false;
        if (symbolFilter !== 'all' && t.symbol !== symbolFilter) return false;
        if (dirFilter !== 'all' && t.direction !== dirFilter) return false;
        if (outFilter !== 'all' && t.status !== outFilter) return false;
        if (gradeFilter === 'A' && t.grade !== 'A') return false;
        if (sourceFilter !== 'all') {
          const src = (t.source ?? 'manual').toLowerCase();
          if (sourceFilter === 'mt5' && !src.includes('mt5')) return false;
          if (sourceFilter === 'demo' && src !== 'demo' && src !== 'demo_mt5_sample') return false;
          if (sourceFilter === 'manual' && src !== 'manual') return false;
          if (sourceFilter === 'paper' && src !== 'paper') return false;
          if (sourceFilter === 'backtest' && !src.includes('backtest')) return false;
        }
        return true;
      }),
    [trades, search, symbolFilter, dirFilter, outFilter, gradeFilter, sourceFilter]
  );

  const grouped = useMemo(() => {
    const m = new Map<string, Trade[]>();
    for (const t of filtered) {
      const k = format(parseISO(t.entryTime), 'yyyy-MM-dd');
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(t);
    }
    return Array.from(m.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const totalPnl = filtered.reduce((s, t) => s + t.pnl, 0);
  const wins = filtered.filter((t) => t.status === 'WIN').length;

  const resetQuickFilters = () => {
    setSymbolFilter('all');
    setDirFilter('all');
    setOutFilter('all');
    setGradeFilter('all');
    setSourceFilter('all');
  };

  return (
    <div className="min-h-screen">
      <Header title="Journal" subtitle={`${trades.length} trades recorded`} compact showDateRange={false} />

      <ModeHeaderStrip />

      <TxPage density="dashboard" className="space-y-5 pb-28 md:pb-6">
        {dataMode === 'demo' && (
          <div className="rounded-[var(--tx-r-20)] border border-[var(--tx-warning)]/30 bg-[var(--tx-warning-soft)] px-4 py-2 text-xs text-[var(--tx-warning)]">
            Demo data — sample trades only. Sign in to load your live journal.
          </div>
        )}
        {dataMode === 'live' && (
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="live" />
          </div>
        )}
        {dataMode === 'live' && trades.length === 0 && (
          <EmptyState
            title="No trades in your journal"
            body="Sync from MT5 or add a trade manually to populate this view."
            actions={
              <button
                type="button"
                className="btn-primary text-sm"
                onClick={() => setAddTradeOpen(true)}
              >
                Add trade
              </button>
            }
          />
        )}
        {addTradeOpen && <AddTradeModal onClose={() => setAddTradeOpen(false)} />}

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          <div className="min-w-[132px] shrink-0 rounded-[var(--tx-r-20)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-1)] p-3">
            <TxMetric label="Showing" value={String(filtered.length)} subline="trades" />
          </div>
          <div className="min-w-[132px] shrink-0 rounded-[var(--tx-r-20)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-1)] p-3">
            <TxMetric
              label="Net P&L"
              value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)}`}
              subline="filtered"
              tone={totalPnl >= 0 ? 'profit' : 'loss'}
            />
          </div>
          <div className="min-w-[132px] shrink-0 rounded-[var(--tx-r-20)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-1)] p-3">
            <TxMetric
              label="Win rate"
              value={filtered.length ? `${((wins / filtered.length) * 100).toFixed(0)}%` : '—'}
              subline={`${wins}W / ${filtered.length - wins}L`}
            />
          </div>
          <div className="min-w-[132px] shrink-0 rounded-[var(--tx-r-20)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-1)] p-3">
            <TxMetric
              label="Avg P&L"
              value={filtered.length ? `$${(totalPnl / filtered.length).toFixed(0)}` : '—'}
              subline="per trade"
            />
          </div>
        </div>

        <PageToolbar onFilter={() => setFilterOpen(true)} filterLabel="Filter trades" />

        <TradeFilterSheet
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={sheetFilters}
          symbols={symbols}
          strategies={strategies}
          onChange={(next) => {
            setOutFilter(next.status === 'all' ? 'all' : next.status);
            setSymbolFilter(next.symbol || 'all');
          }}
        />

        <div className="space-y-3">
          <TxSearchField
            placeholder="Search symbol, strategy, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search trades"
          />

          <JournalFilterBar
            tradeCount={trades.length}
            symbols={symbols}
            symbolCounts={symbolCounts}
            symbolFilter={symbolFilter}
            dirFilter={dirFilter}
            outFilter={outFilter}
            gradeFilter={gradeFilter}
            sourceFilter={sourceFilter}
            search={search}
            onResetAll={() => {
              resetQuickFilters();
              setSearch('');
            }}
            onSymbolFilter={(sym) =>
              setSymbolFilter((prev) => (prev === sym ? 'all' : sym))
            }
            onDirFilter={setDirFilter}
            onOutFilter={setOutFilter}
            onGradeFilter={(g) => setGradeFilter(g)}
            onSourceFilter={setSourceFilter}
          />

          <div className="flex flex-wrap gap-2 justify-end">
            <button type="button" className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <TxCard padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <span className="text-sm font-semibold text-white">{filtered.length} trades</span>
            <button
              type="button"
              className="btn-primary text-sm hidden sm:inline-flex"
              onClick={() => setAddTradeOpen(true)}
            >
              <Plus className="w-4 h-4" /> Add trade
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500 px-4">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-slate-400">No trades match</p>
              <p className="text-sm mt-1">Adjust chips or clear search</p>
            </div>
          ) : (
            <div className="p-4 space-y-8">
              {grouped.map(([dayKey, dayTrades]) => (
                <section key={dayKey}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {format(parseISO(dayKey), 'EEEE, MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {dayTrades.map((trade) => (
                      <JournalTradeCard
                        key={trade.id}
                        trade={trade}
                        expanded={expandedId === trade.id}
                        onToggle={() =>
                          setExpandedId((prev) => (prev === trade.id ? null : trade.id))
                        }
                        onOpenDrawer={() => setSelectedTrade(trade)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </TxCard>
      </TxPage>

      <BottomActionBar>
        <TxButton variant="primary" size="lg" fullWidth onClick={() => setAddTradeOpen(true)}>
          <Plus className="h-5 w-5" />
          Add trade
        </TxButton>
      </BottomActionBar>

      {selectedTrade &&
        (() => {
          const drawerTrade = trades.find((t) => t.id === selectedTrade.id) ?? selectedTrade;
          return (
            <TradeDrawer
              key={drawerTrade.id}
              trade={drawerTrade}
              onClose={() => setSelectedTrade(null)}
            />
          );
        })()}
    </div>
  );
}
