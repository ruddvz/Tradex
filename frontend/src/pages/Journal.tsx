import { useState, useMemo } from 'react';
import { Search, Filter, Download, Plus, Clock, Trash2, BarChart3 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { AddTradeModal } from '../components/journal/AddTradeModal';
import { useStore } from '../store/useStore';
import { PnlBadge, DirectionBadge, GradeBadge, Badge } from '../components/ui/Badge';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { Trade } from '../types';

const emotionEmojis: Record<string, string> = {
  Confident: '💪',
  Focused: '🎯',
  Calm: '😌',
  Anxious: '😰',
  Fearful: '😨',
  Greedy: '💰',
  FOMO: '😱',
  Revenge: '😤',
  Neutral: '😐',
  Excited: '🤩',
  Patient: '🧘',
};

function TradeDrawer({
  trade,
  onClose,
}: {
  trade: Trade;
  onClose: () => void;
}) {
  const { deleteTrade } = useStore();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-surface border border-surface-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-card-hover animate-slide-up"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center font-bold text-white">
              {trade.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">{trade.symbol}</span>
                <DirectionBadge direction={trade.direction} />
                <GradeBadge grade={trade.grade} />
              </div>
              <span className="text-xs text-slate-400">
                {format(new Date(trade.entryTime), 'MMM dd, yyyy · h:mm a')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-light text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div
            className={clsx(
              'p-4 rounded-xl text-center',
              trade.pnl >= 0
                ? 'bg-brand-500/10 border border-brand-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            )}
          >
            <div className={clsx('text-3xl font-bold', trade.pnl >= 0 ? 'text-brand-400' : 'text-red-400')}>
              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {trade.rMultiple >= 0 ? '+' : ''}
              {trade.rMultiple}R · {trade.pnl >= 0 ? '+' : ''}
              {trade.pnlPercent}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Entry Price', value: trade.entryPrice.toFixed(trade.symbol === 'XAUUSD' ? 2 : 5) },
              { label: 'Exit Price', value: trade.exitPrice.toFixed(trade.symbol === 'XAUUSD' ? 2 : 5) },
              { label: 'Stop Loss', value: trade.stopLoss.toFixed(2) },
              { label: 'Take Profit', value: trade.takeProfit.toFixed(2) },
              { label: 'Lot Size', value: trade.lotSize.toFixed(2) },
              { label: 'Duration', value: `${trade.duration}m` },
              { label: 'Commission', value: `$${trade.commission.toFixed(2)}` },
              { label: 'Session', value: trade.session },
            ].map(({ label, value }) => (
              <div key={label} className="bg-dark-300 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                <div className="text-sm font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-lg">
            <span className="text-2xl">{emotionEmojis[trade.emotion] || '😐'}</span>
            <div>
              <div className="text-xs text-slate-500">Emotion</div>
              <div className="text-sm font-semibold text-white">{trade.emotion}</div>
            </div>
            <div className="ml-auto">
              <div className="text-xs text-slate-500 mb-1">Discipline Score</div>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'w-2 h-4 rounded-sm',
                      i < trade.emotionScore ? 'bg-brand-500' : 'bg-surface-border'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {trade.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {trade.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-surface-light rounded-lg text-xs text-slate-400 border border-surface-border"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {trade.notes && (
            <div className="p-3 bg-dark-300 rounded-lg">
              <div className="text-xs text-slate-500 mb-1.5">Trade Notes</div>
              <p className="text-sm text-slate-300">{trade.notes}</p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-surface-border">
          <button
            type="button"
            onClick={() => {
              deleteTrade(trade.id);
              onClose();
            }}
            className="btn-danger w-full justify-center"
          >
            <Trash2 className="w-4 h-4" />
            Delete Trade
          </button>
        </div>
      </div>
    </div>
  );
}

export function Journal() {
  const { trades } = useStore();
  const [search, setSearch] = useState('');
  const [symbolFilter, setSymbolFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [addTradeOpen, setAddTradeOpen] = useState(false);

  const symbols = useMemo(() => ['all', ...Array.from(new Set(trades.map(t => t.symbol)))], [trades]);

  const filtered = useMemo(
    () =>
      trades.filter(t => {
        const q = search.toLowerCase();
        const matchSearch =
          !search ||
          t.symbol.toLowerCase().includes(q) ||
          t.strategy.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;
        const matchSymbol = symbolFilter === 'all' || t.symbol === symbolFilter;
        return matchSearch && matchStatus && matchSymbol;
      }),
    [trades, search, statusFilter, symbolFilter]
  );

  const totalPnl = filtered.reduce((s, t) => s + t.pnl, 0);
  const wins = filtered.filter(t => t.status === 'WIN').length;

  return (
    <div className="min-h-screen">
      <Header
        title="Trade Journal"
        subtitle={`${trades.length} trades recorded`}
        onAddTrade={() => setAddTradeOpen(true)}
      />

      <div className="page-shell p-6 space-y-5">
        {addTradeOpen && <AddTradeModal onClose={() => setAddTradeOpen(false)} />}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Filtered Trades', value: filtered.length, sub: 'trades' },
            {
              label: 'Net P&L',
              value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)}`,
              sub: 'filtered',
            },
            {
              label: 'Win Rate',
              value: filtered.length ? `${((wins / filtered.length) * 100).toFixed(0)}%` : '—',
              sub: `${wins}W / ${filtered.length - wins}L`,
            },
            {
              label: 'Avg P&L',
              value: filtered.length ? `$${(totalPnl / filtered.length).toFixed(0)}` : '—',
              sub: 'per trade',
            },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <div className="text-xs text-slate-500 mb-1">{s.label}</div>
              <div
                className={clsx(
                  'text-xl font-bold',
                  s.label === 'Net P&L' ? (totalPnl >= 0 ? 'text-brand-400' : 'text-red-400') : 'text-white'
                )}
              >
                {s.value}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                className="input pl-10"
                placeholder="Search by symbol, strategy, notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="select" value={symbolFilter} onChange={e => setSymbolFilter(e.target.value)}>
              {symbols.map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Symbols' : s}
                </option>
              ))}
            </select>
            <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Results</option>
              <option value="WIN">Wins Only</option>
              <option value="LOSS">Losses Only</option>
              <option value="BREAKEVEN">Breakeven</option>
            </select>
            <button type="button" className="btn-secondary">
              <Filter className="w-4 h-4" /> More Filters
            </button>
            <button type="button" className="btn-secondary">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <span className="text-sm font-semibold text-white">{filtered.length} Trades</span>
            <button type="button" className="btn-primary text-sm" onClick={() => setAddTradeOpen(true)}>
              <Plus className="w-4 h-4" /> Add Trade
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500 px-4">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-slate-400">No trades found</p>
              <p className="text-sm mt-1">Try adjusting your filters or add a new trade</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px]">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="table-header text-left">Symbol</th>
                    <th className="table-header text-left hidden sm:table-cell">Date</th>
                    <th className="table-header text-left hidden md:table-cell">Strategy</th>
                    <th className="table-header text-right">P&L</th>
                    <th className="table-header text-center">R:R</th>
                    <th className="table-header text-center">Grade</th>
                    <th className="table-header text-left hidden lg:table-cell">Emotion</th>
                    <th className="table-header text-left hidden xl:table-cell">Session</th>
                    <th className="table-header text-left hidden lg:table-cell">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(trade => (
                    <tr
                      key={trade.id}
                      className="table-row cursor-pointer"
                      onClick={() => setSelectedTrade(trade)}
                    >
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-surface-light flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                            {trade.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{trade.symbol}</div>
                            <DirectionBadge direction={trade.direction} />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <div className="text-xs text-slate-400">{format(new Date(trade.entryTime), 'MMM dd')}</div>
                        <div className="text-xs text-slate-600">{format(new Date(trade.entryTime), 'HH:mm')}</div>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="text-xs text-slate-400">{trade.strategy}</span>
                      </td>
                      <td className="table-cell text-right">
                        <PnlBadge value={trade.pnl} />
                      </td>
                      <td className="table-cell text-center">
                        <span
                          className={clsx(
                            'text-xs font-mono font-semibold',
                            trade.rMultiple >= 1 ? 'text-brand-400' : 'text-red-400'
                          )}
                        >
                          {trade.rMultiple >= 0 ? '+' : ''}
                          {trade.rMultiple}R
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <GradeBadge grade={trade.grade} />
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <span className="text-sm">{emotionEmojis[trade.emotion] || ''}</span>
                        <span className="text-xs text-slate-500 ml-1">{trade.emotion}</span>
                      </td>
                      <td className="table-cell hidden xl:table-cell">
                        <Badge variant="neutral" size="xs">
                          {trade.session}
                        </Badge>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {trade.duration}m
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedTrade && <TradeDrawer trade={selectedTrade} onClose={() => setSelectedTrade(null)} />}
    </div>
  );
}
