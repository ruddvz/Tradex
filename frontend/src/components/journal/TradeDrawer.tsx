import { useState } from 'react';
import { format } from 'date-fns';
import { Save, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { Trade } from '../../types';
import { useStore } from '../../store/useStore';
import { useToast } from '../ui/Toast';
import { DirectionBadge, GradeBadge } from '../ui/Badge';
import { TxBottomSheet } from '../ui/TxBottomSheet';
import { TxDrawer } from '../ui/TxDrawer';
import { TxButton } from '../ui/TxButton';
import { TxInput, TxSelect, TxTextarea } from '../ui/TxField';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { ScreenshotUploadZone } from './ScreenshotUploadZone';
import { TradeSourcePill } from './TradeSourcePill';

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

const SESSION_OPTIONS: Trade['session'][] = ['London', 'New York', 'Tokyo', 'Sydney', 'Overlap'];
const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'F'] as const;

function TradeDrawerBody({ trade, onClose }: { trade: Trade; onClose: () => void }) {
  const { deleteTrade, updateTrade, dataMode } = useStore();
  const { showToast } = useToast();
  const [notes, setNotes] = useState(trade.notes ?? '');
  const [session, setSession] = useState<Trade['session']>(trade.session);
  const [emotion, setEmotion] = useState<Trade['emotion']>(trade.emotion);
  const [emotionScore, setEmotionScore] = useState(trade.emotionScore);
  const [strategy, setStrategy] = useState(trade.strategy ?? '');
  const [grade, setGrade] = useState(trade.grade);
  const [saving, setSaving] = useState(false);

  const saveJournalFields = async () => {
    setSaving(true);
    try {
      updateTrade(trade.id, { notes, session, emotion, emotionScore, strategy, grade });
      showToast(dataMode === 'live' ? 'Trade journal saved' : 'Trade updated (demo)');
    } finally {
      setSaving(false);
    }
  };

  const beforeSrc = trade.screenshotBeforeUrl || trade.screenshot;
  const afterSrc = trade.screenshotAfterUrl;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <DirectionBadge direction={trade.direction} />
        <GradeBadge grade={trade.grade} />
        <TradeSourcePill source={trade.source} />
      </div>

      <div
        className={clsx(
          'rounded-[var(--tx-r-20)] border p-4 text-center',
          trade.pnl >= 0
            ? 'border-[var(--tx-profit)]/30 bg-[var(--tx-profit-soft)]'
            : 'border-[var(--tx-loss)]/30 bg-[var(--tx-loss-soft)]'
        )}
      >
        <div
          className={clsx(
            'text-3xl font-bold tabular-nums',
            trade.pnl >= 0 ? 'text-[var(--tx-profit)]' : 'text-[var(--tx-loss)]'
          )}
        >
          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
        </div>
        <div className="mt-1 text-sm text-[var(--tx-text-3)]">
          {trade.rMultiple >= 0 ? '+' : ''}
          {trade.rMultiple}R · {trade.pnl >= 0 ? '+' : ''}
          {trade.pnlPercent}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Entry', value: trade.entryPrice.toFixed(trade.symbol === 'XAUUSD' ? 2 : 5) },
          { label: 'Exit', value: trade.exitPrice.toFixed(trade.symbol === 'XAUUSD' ? 2 : 5) },
          { label: 'Stop loss', value: trade.stopLoss.toFixed(2) },
          { label: 'Take profit', value: trade.takeProfit.toFixed(2) },
          { label: 'Lots', value: trade.lotSize.toFixed(2) },
          { label: 'Duration', value: `${trade.duration}m` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-[var(--tx-r-16)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-inset)] p-3"
          >
            <div className="text-xs text-[var(--tx-text-4)]">{label}</div>
            <div className="text-sm font-semibold text-[var(--tx-text-1)]">{value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-[var(--tx-r-20)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-inset)] p-4">
        <TxSelect
          label="Session"
          value={session}
          onChange={(e) => setSession(e.target.value as Trade['session'])}
        >
          {SESSION_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </TxSelect>
        <TxSelect
          label="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value as Trade['grade'])}
        >
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </TxSelect>
        <TxInput
          label="Strategy / setup"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
        />
        <TxSelect
          label="Emotion"
          value={emotion}
          onChange={(e) => setEmotion(e.target.value as Trade['emotion'])}
        >
          {Object.keys(emotionEmojis).map((e) => (
            <option key={e} value={e}>
              {emotionEmojis[e]} {e}
            </option>
          ))}
        </TxSelect>
        <label className="block">
          <span className="text-[13px] font-semibold text-[var(--tx-text-3)]">
            Discipline (1–10)
          </span>
          <input
            type="range"
            min={1}
            max={10}
            value={emotionScore}
            onChange={(e) => setEmotionScore(Number(e.target.value))}
            className="mt-2 w-full min-h-[44px] accent-[var(--tx-profit)]"
          />
        </label>
        <TxTextarea
          label="Trade notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="What went well? What to improve?"
        />
        <TxButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={saving}
          onClick={() => void saveJournalFields()}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save journal'}
        </TxButton>
      </div>

      {trade.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {trade.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[var(--tx-r-pill)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-2)] px-2 py-1 text-xs text-[var(--tx-text-3)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ScreenshotUploadZone
          tradeId={trade.id}
          slot="before"
          label="Before trade"
          url={beforeSrc}
          onUploaded={(partial) => updateTrade(trade.id, partial)}
        />
        <ScreenshotUploadZone
          tradeId={trade.id}
          slot="after"
          label="After trade"
          url={afterSrc}
          onUploaded={(partial) => updateTrade(trade.id, partial)}
        />
      </div>

      <TxButton
        variant="danger"
        size="lg"
        fullWidth
        onClick={() => {
          void deleteTrade(trade.id);
          onClose();
        }}
      >
        <Trash2 className="h-4 w-4" />
        Delete trade
      </TxButton>
    </div>
  );
}

export function TradeDrawer({ trade, onClose }: { trade: Trade; onClose: () => void }) {
  const isMobile = useIsMobile(768);
  const title = `${trade.symbol} ${trade.direction}`;
  const subtitle = format(new Date(trade.entryTime), 'MMM dd, yyyy · h:mm a');

  const footer = undefined;

  if (isMobile) {
    return (
      <TxBottomSheet open onClose={onClose} title={title} description={subtitle} footer={footer}>
        <TradeDrawerBody trade={trade} onClose={onClose} />
      </TxBottomSheet>
    );
  }

  return (
    <TxDrawer
      open
      onClose={onClose}
      title={title}
      description={subtitle}
      width="lg"
      footer={footer}
    >
      <TradeDrawerBody trade={trade} onClose={onClose} />
    </TxDrawer>
  );
}
