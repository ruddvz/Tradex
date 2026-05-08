import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import type { Trade } from '../../types';

const defaultTrade: Partial<Trade> = {
  symbol: 'XAUUSD',
  direction: 'BUY',
  entryPrice: 0,
  exitPrice: 0,
  stopLoss: 0,
  takeProfit: 0,
  lotSize: 0.1,
  strategy: 'ICT',
  session: 'London',
  emotion: 'Focused',
  emotionScore: 7,
  notes: '',
  tags: [],
  grade: 'B',
  commission: 2.5,
  swap: 0,
};

const symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100', 'GBPJPY', 'AUDUSD'];
const strategies = ['Breakout', 'Mean Reversion', 'Trend Follow', 'Supply/Demand', 'ICT', 'SMC', 'Scalp', 'Swing'];
const sessions: Trade['session'][] = ['London', 'New York', 'Tokyo', 'Sydney', 'Overlap'];
const emotions: Trade['emotion'][] = [
  'Confident',
  'Focused',
  'Calm',
  'Anxious',
  'Fearful',
  'Greedy',
  'FOMO',
  'Revenge',
  'Neutral',
  'Excited',
  'Patient',
];

interface Props {
  onClose: () => void;
}

export function AddTradeModal({ onClose }: Props) {
  const { addTrade } = useStore();
  const [form, setForm] = useState(defaultTrade);
  const [tagInput, setTagInput] = useState('');

  const set = (key: keyof Trade, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    const pnl = parseFloat(
      (
        (form.direction === 'BUY'
          ? form.exitPrice! - form.entryPrice!
          : form.entryPrice! - form.exitPrice!) *
        form.lotSize! *
        100
      ).toFixed(2)
    );
    const status = pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BREAKEVEN';
    const slDist = Math.abs(form.entryPrice! - form.stopLoss!);
    const tpDist = Math.abs(form.takeProfit! - form.entryPrice!);
    const rr = slDist > 0 ? parseFloat((tpDist / slDist).toFixed(2)) : 1;

    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      symbol: form.symbol!,
      direction: form.direction!,
      entryPrice: form.entryPrice!,
      exitPrice: form.exitPrice!,
      stopLoss: form.stopLoss!,
      takeProfit: form.takeProfit!,
      lotSize: form.lotSize!,
      entryTime: new Date().toISOString(),
      exitTime: new Date().toISOString(),
      pnl,
      pnlPercent: parseFloat(((pnl / 10000) * 100).toFixed(2)),
      rMultiple: rr,
      strategy: form.strategy!,
      session: form.session!,
      emotion: form.emotion!,
      emotionScore: form.emotionScore!,
      notes: form.notes ?? '',
      tags: form.tags ?? [],
      duration: 60,
      commission: form.commission!,
      swap: form.swap!,
      status,
      grade: form.grade!,
      riskReward: rr,
      maxDrawdown: 0,
      setup: form.strategy!,
      broker: 'Exness',
      account: 'PRO-10042',
    };

    addTrade(newTrade);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim()) {
      set('tags', [...(form.tags || []), tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-surface border border-surface-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-card-hover animate-slide-up"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-surface z-10">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-400" />
            Log New Trade
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-light text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Symbol</label>
              <select
                className="select"
                value={form.symbol}
                onChange={e => set('symbol', e.target.value)}
              >
                {symbols.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Direction</label>
              <div className="flex gap-2">
                {(['BUY', 'SELL'] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set('direction', d)}
                    className={clsx(
                      'flex-1 py-2 rounded-lg text-sm font-bold border transition-all',
                      form.direction === d
                        ? d === 'BUY'
                          ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                          : 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-dark-300 text-slate-400 border-surface-border hover:border-slate-500'
                    )}
                  >
                    {d === 'BUY' ? '▲ BUY' : '▼ SELL'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: 'entryPrice', label: 'Entry Price' },
                { key: 'exitPrice', label: 'Exit Price' },
                { key: 'stopLoss', label: 'Stop Loss' },
                { key: 'takeProfit', label: 'Take Profit' },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type="number"
                  className="input"
                  step="0.00001"
                  value={(form[key] as number) ?? ''}
                  onChange={e => set(key, parseFloat(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Lot Size</label>
              <input
                type="number"
                className="input"
                step="0.01"
                value={form.lotSize ?? ''}
                onChange={e => set('lotSize', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Strategy</label>
              <select
                className="select"
                value={form.strategy}
                onChange={e => set('strategy', e.target.value)}
              >
                {strategies.map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Session</label>
              <select
                className="select"
                value={form.session}
                onChange={e => set('session', e.target.value as Trade['session'])}
              >
                {sessions.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Emotion</label>
              <select
                className="select"
                value={form.emotion}
                onChange={e => set('emotion', e.target.value as Trade['emotion'])}
              >
                {emotions.map(e => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Grade</label>
              <div className="flex gap-1.5">
                {(['A', 'B', 'C', 'D', 'F'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('grade', g)}
                    className={clsx(
                      'flex-1 py-1.5 rounded text-xs font-bold border transition-all',
                      form.grade === g
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                        : 'bg-dark-300 text-slate-500 border-surface-border'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="Trade rationale, observations..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Tags</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
              />
              <button type="button" onClick={addTag} className="btn-secondary px-3">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(form.tags || []).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-surface-light rounded-lg text-xs text-slate-400 border border-surface-border flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => set('tags', form.tags!.filter(t => t !== tag))}
                    className="text-slate-600 hover:text-red-400 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="btn-primary flex-1">
              <Plus className="w-4 h-4" />
              Log Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
