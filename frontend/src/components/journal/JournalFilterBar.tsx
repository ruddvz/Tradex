import { TxChip } from '../ui/TxChip';

export interface JournalFilterBarProps {
  tradeCount: number;
  symbols: string[];
  symbolCounts: Map<string, number>;
  symbolFilter: string;
  dirFilter: 'all' | 'BUY' | 'SELL';
  outFilter: 'all' | 'WIN' | 'LOSS' | 'BREAKEVEN';
  gradeFilter: 'all' | 'A';
  sourceFilter: 'all' | 'manual' | 'mt5' | 'paper' | 'backtest' | 'demo';
  search: string;
  onResetAll: () => void;
  onSymbolFilter: (sym: string) => void;
  onDirFilter: (dir: 'all' | 'BUY' | 'SELL') => void;
  onOutFilter: (out: 'all' | 'WIN' | 'LOSS' | 'BREAKEVEN') => void;
  onGradeFilter: (grade: 'all' | 'A') => void;
  onSourceFilter: (
    src: 'all' | 'manual' | 'mt5' | 'paper' | 'backtest' | 'demo'
  ) => void;
}

const SOURCE_OPTIONS = [
  { key: 'all' as const, label: 'All sources' },
  { key: 'manual' as const, label: 'Manual' },
  { key: 'mt5' as const, label: 'MT5' },
  { key: 'paper' as const, label: 'Paper' },
  { key: 'backtest' as const, label: 'Backtest' },
  { key: 'demo' as const, label: 'Demo' },
];

export function JournalFilterBar({
  tradeCount,
  symbols,
  symbolCounts,
  symbolFilter,
  dirFilter,
  outFilter,
  gradeFilter,
  sourceFilter,
  search,
  onResetAll,
  onSymbolFilter,
  onDirFilter,
  onOutFilter,
  onGradeFilter,
  onSourceFilter,
}: JournalFilterBarProps) {
  const allQuickActive =
    symbolFilter === 'all' &&
    dirFilter === 'all' &&
    outFilter === 'all' &&
    gradeFilter === 'all' &&
    !search;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        <TxChip selected={allQuickActive} onClick={onResetAll} count={tradeCount}>
          All
        </TxChip>
        {symbols.map((sym) => (
          <TxChip
            key={sym}
            selected={symbolFilter === sym}
            count={symbolCounts.get(sym) ?? 0}
            onClick={() => onSymbolFilter(sym)}
          >
            {sym}
          </TxChip>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <TxChip selected={dirFilter === 'all'} onClick={() => onDirFilter('all')}>
          Both sides
        </TxChip>
        <TxChip selected={dirFilter === 'BUY'} onClick={() => onDirFilter('BUY')}>
          Long
        </TxChip>
        <TxChip selected={dirFilter === 'SELL'} onClick={() => onDirFilter('SELL')}>
          Short
        </TxChip>
      </div>

      <div className="flex flex-wrap gap-2">
        <TxChip selected={outFilter === 'all'} onClick={() => onOutFilter('all')}>
          All results
        </TxChip>
        <TxChip selected={outFilter === 'WIN'} variant="success" onClick={() => onOutFilter('WIN')}>
          Winners
        </TxChip>
        <TxChip selected={outFilter === 'LOSS'} variant="danger" onClick={() => onOutFilter('LOSS')}>
          Losses
        </TxChip>
        <TxChip
          selected={outFilter === 'BREAKEVEN'}
          variant="warning"
          onClick={() => onOutFilter('BREAKEVEN')}
        >
          Breakeven
        </TxChip>
        <TxChip
          selected={gradeFilter === 'A'}
          variant="info"
          onClick={() => onGradeFilter(gradeFilter === 'A' ? 'all' : 'A')}
        >
          A grade
        </TxChip>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-[var(--tx-text-3)] mr-1">Source:</span>
        {SOURCE_OPTIONS.map((opt) => (
          <TxChip
            key={opt.key}
            selected={sourceFilter === opt.key}
            onClick={() => onSourceFilter(opt.key)}
          >
            {opt.label}
          </TxChip>
        ))}
      </div>
    </div>
  );
}
