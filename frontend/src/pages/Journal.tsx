import { useState, useMemo, useRef } from 'react';
import { Search, Download, Plus, Clock, Trash2, BarChart3, ImagePlus } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { AddTradeModal } from '../components/journal/AddTradeModal';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { getToken } from '../lib/auth';
import { DirectionBadge, GradeBadge } from '../components/ui/Badge';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import type { Trade } from '../types';
import { JournalTradeCard } from '../components/journal/JournalTradeCard';

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

function ScreenshotUploadZone({
  tradeId,
  slot,
  label,
  url,
  onUploaded,
}: {
  tradeId: string;
  slot: 'before' | 'after';
  label: string;
  url?: string;
  onUploaded: (payload: Partial<Trade>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const onPick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getToken();
    if (!token) {
      showToast('Sign in to attach screenshots (Journal uses live API when authenticated).');
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/v1/trades/${tradeId}/screenshot?slot=${slot}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        const detail = data.detail;
        showToast(typeof detail === 'string' ? detail : 'Upload failed');
        return;
      }
      const patch: Partial<Trade> = {};
      if (typeof data.screenshot_before_url === 'string')
        patch.screenshotBeforeUrl = data.screenshot_before_url;
      if (typeof data.screenshot_after_url === 'string')
        patch.screenshotAfterUrl = data.screenshot_after_url;
      if (Object.keys(patch).length > 0) onUploaded(patch);
      showToast('Screenshot saved');
    } catch {
      showToast('Upload failed — is the API running?');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const displayUrl = url;

  return (
    <div className="rounded-xl border border-dashed border-surface-border bg-dark-300/40 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <ImagePlus className="h-4 w-4 text-brand-400" />
        {label}
      </div>
      {displayUrl ? (
        <img
          src={displayUrl}
          alt={label}
          className="mb-3 max-h-44 w-full rounded-lg object-contain"
        />
      ) : (
        <p className="mb-3 text-xs text-slate-500">No image yet</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={onFile}
      />
      <button
        type="button"
        className="btn-secondary w-full justify-center text-sm"
        onClick={onPick}
        disabled={busy}
      >
        {busy ? 'Uploading…' : displayUrl ? 'Replace' : 'Upload'}
      </button>
    </div>
  );
}

function TradeDrawer({
  trade,
  onClose,
}: {
  trade: Trade;
  onClose: () => void;
}) {
  const { deleteTrade, updateTrade } = useStore();

  const beforeSrc = trade.screenshotBeforeUrl || trade.screenshot;
  const afterSrc = trade.screenshotAfterUrl;

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

          <div className="no-print border-t border-surface-border pt-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Chart screenshots
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ScreenshotUploadZone
                tradeId={trade.id}
                slot="before"
                label="Before trade"
                url={beforeSrc}
                onUploaded={partial => updateTrade(trade.id, partial)}
              />
              <ScreenshotUploadZone
                tradeId={trade.id}
                slot="after"
                label="After trade"
                url={afterSrc}
                onUploaded={partial => updateTrade(trade.id, partial)}
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-surface-border">
          <button
            type="button"
            onClick={() => {
              void deleteTrade(trade.id);
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
  const [symbolFilter, setSymbolFilter] = useState<string>('all');
  const [dirFilter, setDirFilter] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [outFilter, setOutFilter] = useState<'all' | 'WIN' | 'LOSS' | 'BREAKEVEN'>('all');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'A'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [addTradeOpen, setAddTradeOpen] = useState(false);

  const symbols = useMemo(() => Array.from(new Set(trades.map(t => t.symbol))).sort(), [trades]);

  const symbolCounts = useMemo(() => {
    const m = new Map<string, number>();
    trades.forEach(t => m.set(t.symbol, (m.get(t.symbol) ?? 0) + 1));
    return m;
  }, [trades]);

  const filtered = useMemo(
    () =>
      trades.filter(t => {
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
        return true;
      }),
    [trades, search, symbolFilter, dirFilter, outFilter, gradeFilter]
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
  const wins = filtered.filter(t => t.status === 'WIN').length;

  const resetQuickFilters = () => {
    setSymbolFilter('all');
    setDirFilter('all');
    setOutFilter('all');
    setGradeFilter('all');
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Journal"
        subtitle={`${trades.length} trades recorded`}
        onAddTrade={() => setAddTradeOpen(true)}
      />

      <div className="page-shell p-6 space-y-5 pb-28 md:pb-6">
        {addTradeOpen && <AddTradeModal onClose={() => setAddTradeOpen(false)} />}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Showing', value: filtered.length, sub: 'trades' },
            {
              label: 'Net P&L',
              value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)}`,
              sub: 'filtered',
            },
            {
              label: 'Win rate',
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

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="input pl-10 min-h-[48px]"
              placeholder="Search symbol, strategy, notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            <button
              type="button"
              className={clsx(
                'chip',
                symbolFilter === 'all' &&
                  dirFilter === 'all' &&
                  outFilter === 'all' &&
                  gradeFilter === 'all' &&
                  !search &&
                  'chip-active'
              )}
              onClick={() => {
                resetQuickFilters();
                setSearch('');
              }}
            >
              All {trades.length}
            </button>
            {symbols.map(sym => (
              <button
                key={sym}
                type="button"
                className={clsx('chip', symbolFilter === sym && 'chip-active')}
                onClick={() => setSymbolFilter(prev => (prev === sym ? 'all' : sym))}
              >
                {sym}{' '}
                <span className="text-slate-500">{symbolCounts.get(sym) ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={clsx('chip', dirFilter === 'all' && 'chip-active')}
              onClick={() => setDirFilter('all')}
            >
              Both sides
            </button>
            <button
              type="button"
              className={clsx('chip', dirFilter === 'BUY' && 'chip-active')}
              onClick={() => setDirFilter('BUY')}
            >
              Long
            </button>
            <button
              type="button"
              className={clsx('chip', dirFilter === 'SELL' && 'chip-active')}
              onClick={() => setDirFilter('SELL')}
            >
              Short
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={clsx('chip', outFilter === 'all' && 'chip-active')}
              onClick={() => setOutFilter('all')}
            >
              All results
            </button>
            <button
              type="button"
              className={clsx('chip', outFilter === 'WIN' && 'chip-active')}
              onClick={() => setOutFilter('WIN')}
            >
              Winners
            </button>
            <button
              type="button"
              className={clsx('chip', outFilter === 'LOSS' && 'chip-active')}
              onClick={() => setOutFilter('LOSS')}
            >
              Losses
            </button>
            <button
              type="button"
              className={clsx('chip', outFilter === 'BREAKEVEN' && 'chip-active')}
              onClick={() => setOutFilter('BREAKEVEN')}
            >
              Breakeven
            </button>
            <button
              type="button"
              className={clsx('chip', gradeFilter === 'A' && 'chip-active')}
              onClick={() => setGradeFilter(gradeFilter === 'A' ? 'all' : 'A')}
            >
              A grade
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button type="button" className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <span className="text-sm font-semibold text-white">{filtered.length} trades</span>
            <button type="button" className="btn-primary text-sm hidden sm:inline-flex" onClick={() => setAddTradeOpen(true)}>
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
                    {dayTrades.map(trade => (
                      <JournalTradeCard
                        key={trade.id}
                        trade={trade}
                        expanded={expandedId === trade.id}
                        onToggle={() =>
                          setExpandedId(prev => (prev === trade.id ? null : trade.id))
                        }
                        onOpenDrawer={() => setSelectedTrade(trade)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="fixed z-40 md:z-30 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-5 md:bottom-8 md:right-8 rounded-full btn-primary shadow-glow min-h-[52px] min-w-[52px] px-5 flex items-center gap-2"
        onClick={() => setAddTradeOpen(true)}
        aria-label="Add trade"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline font-semibold">Add trade</span>
      </button>

      {selectedTrade && <TradeDrawer trade={selectedTrade} onClose={() => setSelectedTrade(null)} />}
    </div>
  );
}
