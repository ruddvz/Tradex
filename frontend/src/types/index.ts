export interface Trade {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  entryTime: string;
  exitTime: string;
  pnl: number;
  pnlPercent: number;
  rMultiple: number;
  stopLoss: number;
  takeProfit: number;
  strategy: string;
  session: 'London' | 'New York' | 'Tokyo' | 'Sydney' | 'Overlap';
  emotion: EmotionType;
  emotionScore: number;
  notes: string;
  tags: string[];
  /** Legacy single screenshot from older mocks */
  screenshot?: string;
  /** Chart screenshots (match API snake_case mapping in clients) */
  screenshotBeforeUrl?: string;
  screenshotAfterUrl?: string;
  duration: number; // minutes
  commission: number;
  swap: number;
  status: 'WIN' | 'LOSS' | 'BREAKEVEN';
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  riskReward: number;
  maxDrawdown: number;
  setup: string;
  broker: string;
  account: string;
  /** manual | mt5_live | mt5_demo | csv | paper | backtest */
  source?: string;
}

export type EmotionType = 
  | 'Confident' | 'Focused' | 'Calm' 
  | 'Anxious' | 'Fearful' | 'Greedy' 
  | 'FOMO' | 'Revenge' | 'Neutral' 
  | 'Excited' | 'Patient';

export interface DailyStats {
  date: string;
  pnl: number;
  trades: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
}

export interface PerformanceMetrics {
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  avgRR: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  breakevenTrades: number;
  bestTrade: number;
  worstTrade: number;
  avgHoldTime: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  sharpeRatio: number;
  expectancy: number;
  avgDailyPnl: number;
  tradingDays: number;
}

export interface PropFirmChallenge {
  id: string;
  name: string;
  firm: string;
  accountSize: number;
  profitTarget: number;
  maxDrawdown: number;
  dailyDrawdown: number;
  minTradingDays: number;
  startDate: string;
  endDate: string;
  currentPnl: number;
  currentDrawdown: number;
  dailyLoss: number;
  status: 'active' | 'passed' | 'failed' | 'at_risk';
  phase: 'phase1' | 'phase2' | 'funded';
  trades: number;
  daysTraded: number;
}

export interface Playbook {
  id: string;
  name: string;
  type: 'strategy' | 'symbol' | 'session' | 'timeframe' | 'pattern';
  winRate: number;
  trades: number;
  profit: number;
  profitFactor: number;
  avgRR: number;
  description: string;
  rules: string[];
  tags: string[];
  performance: { date: string; pnl: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface NotebookEntry {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'rule' | 'setup' | 'lesson' | 'checklist';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

export interface AIInsight {
  id: string;
  type: 'pattern' | 'warning' | 'opportunity' | 'achievement' | 'psychology';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  broker: string;
  balance: number;
  equity: number;
  currency: string;
  type: 'demo' | 'live' | 'prop';
  connected: boolean;
  lastSync?: string;
}

/** Simulated paper broker account (API: `paper_accounts`). */
export interface PaperAccount {
  id: string;
  userId: string;
  name: string;
  currency: string;
  startingBalance: number;
  isActive: boolean;
  createdAt: string;
}

export interface CalendarDay {
  date: string;
  pnl: number;
  trades: number;
  isTrading: boolean;
}

export interface EquityPoint {
  date: string;
  equity: number;
  balance: number;
  drawdown: number;
}

export type ManualTaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type ManualTaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'skipped'
  | 'failed';

export type ManualTaskCategory =
  | 'initial_setup'
  | 'security'
  | 'broker_connection'
  | 'paper_trading'
  | 'risk'
  | 'journal_cleanup'
  | 'strategy_testing'
  | 'pwa_setup'
  | 'maintenance'
  | 'critical_issues';

export type ManualTaskActionType = 'internal_route' | 'external_url' | 'command' | 'manual';

export interface ManualTaskChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface ManualTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: ManualTaskCategory | string;
  priority: ManualTaskPriority | string;
  status: ManualTaskStatus | string;
  checklist: ManualTaskChecklistItem[];
  action_type?: ManualTaskActionType | string;
  action_payload?: Record<string, unknown>;
  due_at?: string;
  completed_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
