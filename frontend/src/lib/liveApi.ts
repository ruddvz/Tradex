import { addDays, format, subDays } from 'date-fns';
import type {
  PerformanceMetrics,
  PropFirmChallenge,
  NotebookEntry,
  AIInsight,
  Account,
  Trade,
} from '../types';
import { mapApiTradeRow } from './mapApiTrade';

export type DataSource = 'demo' | 'live';

export interface SetupHealth {
  database: string;
  redis: string;
  openai: string;
  mt5: string;
  pwa: string;
  paper_account: string;
  risk_rules: string;
  critical_issues: string[];
}

export function dateRangeToQueryParams(range: '7d' | '30d' | '90d' | 'all'): string {
  if (range === 'all') return '';
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const to = format(new Date(), 'yyyy-MM-dd');
  const from = format(subDays(new Date(), days), 'yyyy-MM-dd');
  return `from_date=${encodeURIComponent(from)}&to_date=${encodeURIComponent(to)}`;
}

export function mapAnalyticsToMetrics(row: Record<string, unknown>): PerformanceMetrics {
  const maxDd = Number(row.max_drawdown ?? 0);
  return {
    totalPnl: Number(row.total_pnl ?? 0),
    winRate: Number(row.win_rate ?? 0),
    profitFactor: Number(row.profit_factor ?? 0),
    avgWin: Number(row.avg_win ?? 0),
    avgLoss: Number(row.avg_loss ?? 0),
    avgRR: Number(row.avg_rr ?? 0),
    maxDrawdown: maxDd,
    maxDrawdownPercent: maxDd,
    totalTrades: Number(row.total_trades ?? 0),
    winTrades: Number(row.win_trades ?? 0),
    lossTrades: Number(row.loss_trades ?? 0),
    breakevenTrades: Number(row.breakeven_trades ?? 0),
    bestTrade: Number(row.best_trade ?? 0),
    worstTrade: Number(row.worst_trade ?? 0),
    avgHoldTime: Number(row.avg_hold_time ?? 0),
    maxConsecutiveWins: Number(row.max_consecutive_wins ?? 0),
    maxConsecutiveLosses: Number(row.max_consecutive_losses ?? 0),
    sharpeRatio: Number(row.sharpe_ratio ?? 0),
    expectancy: Number(row.expectancy ?? 0),
    avgDailyPnl: Number(row.avg_daily_pnl ?? 0),
    tradingDays: Number(row.trading_days ?? 0),
  };
}

export const EMPTY_PROP_CHALLENGE: PropFirmChallenge = {
  id: '__empty__',
  name: 'No challenge saved yet',
  firm: '—',
  accountSize: 100_000,
  profitTarget: 10_000,
  maxDrawdown: 10_000,
  dailyDrawdown: 5_000,
  minTradingDays: 10,
  startDate: format(new Date(), 'yyyy-MM-dd'),
  endDate: format(addDays(new Date(), 45), 'yyyy-MM-dd'),
  currentPnl: 0,
  currentDrawdown: 0,
  dailyLoss: 0,
  status: 'active',
  phase: 'phase1',
  trades: 0,
  daysTraded: 0,
};

export function mapApiChallenge(row: Record<string, unknown>): PropFirmChallenge {
  const st = String(row.status ?? 'active');
  const allowed: PropFirmChallenge['status'][] = ['active', 'passed', 'failed', 'at_risk'];
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    firm: String(row.firm ?? ''),
    accountSize: Number(row.account_size ?? 0),
    profitTarget: Math.max(1, Number(row.profit_target ?? 1)),
    maxDrawdown: Math.max(1, Number(row.max_drawdown ?? 1)),
    dailyDrawdown: Math.max(1, Number(row.daily_drawdown ?? 1)),
    minTradingDays: Number(row.min_trading_days ?? 0),
    startDate: String(row.start_date ?? '').slice(0, 10),
    endDate: String(row.end_date ?? '').slice(0, 10),
    currentPnl: Number(row.current_pnl ?? 0),
    currentDrawdown: Number(row.current_drawdown ?? 0),
    dailyLoss: Number(row.daily_loss ?? 0),
    status: (allowed.includes(st as PropFirmChallenge['status']) ? st : 'active') as PropFirmChallenge['status'],
    phase: 'phase1',
    trades: Number(row.trades ?? 0),
    daysTraded: Number(row.days_traded ?? 0),
  };
}

export function mapApiNotebookEntry(row: Record<string, unknown>): NotebookEntry {
  const t = String(row.type ?? row.entry_type ?? 'note');
  const allowed: NotebookEntry['type'][] = ['note', 'rule', 'setup', 'lesson', 'checklist'];
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    content: String(row.content ?? ''),
    type: (allowed.includes(t as NotebookEntry['type']) ? t : 'note') as NotebookEntry['type'],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    createdAt: String(row.created_at ?? '').slice(0, 19).replace(' ', 'T'),
    updatedAt: String(row.updated_at ?? row.created_at ?? '').slice(0, 19).replace(' ', 'T'),
    pinned: Boolean(row.pinned),
  };
}

export function mapApiInsights(raw: Record<string, unknown>[]): AIInsight[] {
  return raw.map((ins, i) => {
    const t = String(ins.type ?? 'pattern');
    const types: AIInsight['type'][] = ['pattern', 'warning', 'opportunity', 'achievement', 'psychology'];
    const imp = String(ins.impact ?? 'medium');
    const impacts: AIInsight['impact'][] = ['high', 'medium', 'low'];
    return {
      id: `ai-${i}-${String(ins.title ?? '').slice(0, 24)}`,
      type: (types.includes(t as AIInsight['type']) ? t : 'pattern') as AIInsight['type'],
      title: String(ins.title ?? 'Insight'),
      description: String(ins.description ?? ''),
      impact: (impacts.includes(imp as AIInsight['impact']) ? imp : 'medium') as AIInsight['impact'],
      action: String(ins.action ?? ''),
      createdAt: new Date().toISOString(),
    };
  });
}

export function mapAuthMeToAccount(row: Record<string, unknown>): Account {
  const name = String(row.name ?? 'Trader');
  return {
    id: String(row.id ?? ''),
    name,
    broker: 'API session',
    balance: 10_000,
    equity: 10_000,
    currency: 'USD',
    type: 'demo',
    connected: true,
    lastSync: undefined,
  };
}

export async function fetchTradesList(token: string): Promise<Trade[]> {
  const res = await fetch('/api/v1/trades?limit=500', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { trades?: Record<string, unknown>[] };
  if (!res.ok || !Array.isArray(data.trades)) return [];
  return data.trades.map((r) => mapApiTradeRow(r));
}

export async function fetchMetrics(token: string, range: '7d' | '30d' | '90d' | 'all'): Promise<PerformanceMetrics> {
  const qs = dateRangeToQueryParams(range);
  const url = qs ? `/api/v1/analytics/metrics?${qs}` : '/api/v1/analytics/metrics';
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const row = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) return mapAnalyticsToMetrics({});
  return mapAnalyticsToMetrics(row);
}

export async function fetchChallenges(token: string): Promise<PropFirmChallenge[]> {
  const res = await fetch('/api/v1/challenges', { headers: { Authorization: `Bearer ${token}` } });
  const data = (await res.json().catch(() => ({}))) as { challenges?: Record<string, unknown>[] };
  if (!res.ok || !Array.isArray(data.challenges)) return [];
  return data.challenges.map(mapApiChallenge);
}

export async function fetchNotebook(token: string): Promise<NotebookEntry[]> {
  const res = await fetch('/api/v1/notebook', { headers: { Authorization: `Bearer ${token}` } });
  const data = (await res.json().catch(() => ({}))) as { entries?: Record<string, unknown>[] };
  if (!res.ok || !Array.isArray(data.entries)) return [];
  return data.entries.map(mapApiNotebookEntry);
}

export async function fetchAiInsights(token: string): Promise<AIInsight[]> {
  const res = await fetch('/api/v1/ai/insights', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { insights?: Record<string, unknown>[] };
  if (!res.ok || !Array.isArray(data.insights)) return [];
  return mapApiInsights(data.insights);
}

export async function fetchAuthMe(token: string): Promise<Account | null> {
  const res = await fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  const row = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) return null;
  return mapAuthMeToAccount(row);
}

export async function fetchSetupHealth(token: string): Promise<SetupHealth | null> {
  const res = await fetch('/api/v1/setup/health', { headers: { Authorization: `Bearer ${token}` } });
  const row = (await res.json().catch(() => ({}))) as SetupHealth;
  if (!res.ok) return null;
  return row;
}
