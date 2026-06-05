import type { Trade } from '../types';

/** Minimal Trade rows — must stay in sync with backend/tests/test_metrics_parity.py */
const base = {
  direction: 'BUY' as const,
  entryPrice: 1,
  exitPrice: 1,
  lotSize: 0.1,
  exitTime: '2026-01-02T11:00:00',
  pnlPercent: 0,
  stopLoss: 0,
  takeProfit: 0,
  strategy: 'Test',
  session: 'London' as const,
  emotion: 'Neutral' as const,
  emotionScore: 5,
  notes: '',
  tags: [] as string[],
  commission: 0,
  swap: 0,
  grade: 'B' as const,
  riskReward: 1,
  maxDrawdown: 0,
  setup: '',
  broker: '',
  account: '',
};

export const METRICS_PARITY_TRADES: Trade[] = [
  {
    ...base,
    id: 'mp1',
    symbol: 'EURUSD',
    pnl: 120,
    rMultiple: 2,
    entryTime: '2026-01-02T10:00:00',
    duration: 60,
    status: 'WIN',
  },
  {
    ...base,
    id: 'mp2',
    symbol: 'GBPUSD',
    direction: 'SELL',
    pnl: -60,
    rMultiple: -1,
    entryTime: '2026-01-03T14:00:00',
    duration: 30,
    status: 'LOSS',
  },
  {
    ...base,
    id: 'mp3',
    symbol: 'XAUUSD',
    pnl: 80,
    rMultiple: 1.5,
    entryTime: '2026-01-03T16:00:00',
    duration: 40,
    status: 'WIN',
  },
];

/** Expected values from backend EXPECTED_METRICS (camelCase for frontend). */
export const METRICS_PARITY_EXPECTED = {
  totalTrades: 3,
  winTrades: 2,
  lossTrades: 1,
  totalPnl: 140,
  winRate: 66.7,
  profitFactor: 3.33,
  bestTrade: 120,
  worstTrade: -60,
  tradingDays: 2,
};
