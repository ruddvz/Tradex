import type { CalendarDay, PerformanceMetrics } from '../types';
import { dateRangeToQueryParams } from './liveApi';

export type EquityPoint = {
  date: string;
  equity: number;
  balance: number;
  drawdown?: number;
  pnl?: number;
};

export type DailyPnlPoint = {
  date: string;
  pnl: number;
  trades: number;
};

export function analyticsQueryParams(
  range: '7d' | '30d' | '90d' | 'all',
  accountId?: string | null
): string {
  const parts: string[] = [];
  const rangeQs = dateRangeToQueryParams(range);
  if (rangeQs) parts.push(rangeQs);
  if (accountId) parts.push(`account_id=${encodeURIComponent(accountId)}`);
  return parts.join('&');
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

export function mapEquityCurveFromMetrics(row: Record<string, unknown>): EquityPoint[] {
  const raw = row.equity_curve;
  if (!Array.isArray(raw)) return [];
  return raw.map((p, i) => {
    const pt = p as Record<string, unknown>;
    const equity = Number(pt.equity ?? 0);
    return {
      date: String(pt.date ?? `T${i}`),
      equity,
      balance: Number(pt.balance ?? equity),
      pnl: Number(pt.pnl ?? 0),
    };
  });
}

export function mapDailyPnlFromMetrics(row: Record<string, unknown>): DailyPnlPoint[] {
  const raw = row.daily_pnl;
  if (!Array.isArray(raw)) return [];
  return raw.map((p) => {
    const pt = p as Record<string, unknown>;
    return {
      date: String(pt.date ?? ''),
      pnl: Number(pt.pnl ?? 0),
      trades: Number(pt.trades ?? 0),
    };
  });
}

export function mapCalendarRows(rows: unknown[]): CalendarDay[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => {
    const pt = r as Record<string, unknown>;
    const trades = Number(pt.trades ?? 0);
    return {
      date: String(pt.date ?? ''),
      pnl: Number(pt.pnl ?? 0),
      trades,
      winRate: 0,
      bestTrade: 0,
      worstTrade: 0,
      isTrading: trades > 0,
    };
  });
}
