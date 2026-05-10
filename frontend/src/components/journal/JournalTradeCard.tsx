import { ChevronDown, MessageSquareText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import type { Trade } from '../../types';
import { DirectionBadge, GradeBadge, PnlBadge } from '../ui/Badge';

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

interface JournalTradeCardProps {
  trade: Trade;
  expanded: boolean;
  onToggle: () => void;
  onOpenDrawer: () => void;
}

/** Expandable journal row — Ui.md §10.2 trade card structure (without chart thumbnail). */
export function JournalTradeCard({ trade, expanded, onToggle, onOpenDrawer }: JournalTradeCardProps) {
  const timeLabel = format(parseISO(trade.entryTime), 'h:mm a');

  return (
    <div className="rounded-2xl border border-surface-border bg-dark-300/40 overflow-hidden motion-tab hover:border-brand-500/25">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start justify-between gap-3 min-h-[56px]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-white">{trade.symbol}</span>
            <DirectionBadge direction={trade.direction} />
            <span className="text-xs text-slate-500">· {timeLabel}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <PnlBadge value={trade.pnl} />
            <GradeBadge grade={trade.grade} />
          </div>
        </div>
        <ChevronDown
          className={clsx(
            'w-5 h-5 text-slate-500 shrink-0 transition-transform duration-base',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-surface-border/80 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-0.5">Entry</div>
              <div className="font-mono font-semibold text-slate-200">{trade.entryPrice}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-0.5">Exit</div>
              <div className="font-mono font-semibold text-slate-200">{trade.exitPrice}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-0.5">R:R</div>
              <div
                className={clsx(
                  'font-mono font-semibold',
                  trade.rMultiple >= 1 ? 'text-brand-400' : 'text-red-400'
                )}
              >
                {trade.rMultiple >= 0 ? '+' : ''}
                {trade.rMultiple}R
              </div>
            </div>
          </div>

          {trade.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {trade.tags.slice(0, 6).map((tag) => (
                <span key={tag} className="chip text-[11px] py-1">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {(trade.notes || trade.strategy) && (
            <div className="rounded-xl bg-dark-400/80 border border-surface-border p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                <MessageSquareText className="w-3.5 h-3.5" />
                {trade.strategy ? `Strategy · ${trade.strategy}` : 'Notes'}
              </div>
              <p className="text-xs text-slate-300 line-clamp-3">{trade.notes || '—'}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              {emotionEmojis[trade.emotion]} {trade.emotion} · {trade.session}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDrawer();
              }}
              className="btn-secondary text-xs py-2 px-3"
            >
              Full detail
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
