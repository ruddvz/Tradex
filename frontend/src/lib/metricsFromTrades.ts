import type { PerformanceMetrics, Trade } from '../types';

/** Derive dashboard metrics from a trade list (demo fallback when API metrics unavailable). */
export function computeMetrics(trades: Trade[]): PerformanceMetrics {
  if (trades.length === 0) {
    return {
      totalPnl: 0,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      avgRR: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      totalTrades: 0,
      winTrades: 0,
      lossTrades: 0,
      breakevenTrades: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgHoldTime: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      sharpeRatio: 0,
      expectancy: 0,
      avgDailyPnl: 0,
      tradingDays: 0,
    };
  }

  const wins = trades.filter((t) => t.status === 'WIN');
  const losses = trades.filter((t) => t.status === 'LOSS');
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const totalWins = wins.reduce((s, t) => s + t.pnl, 0);
  const totalLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

  let peak = 10000;
  let equity = 10000;
  let maxDD = 0;
  for (const t of [...trades].reverse()) {
    equity += t.pnl;
    if (equity > peak) peak = equity;
    const dd = (peak - equity) / peak * 100;
    if (dd > maxDD) maxDD = dd;
  }

  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let curWin = 0;
  let curLoss = 0;
  for (const t of [...trades].reverse()) {
    if (t.status === 'WIN') {
      curWin++;
      curLoss = 0;
      maxWinStreak = Math.max(maxWinStreak, curWin);
    } else {
      curLoss++;
      curWin = 0;
      maxLossStreak = Math.max(maxLossStreak, curLoss);
    }
  }

  const uniqueDays = new Set(trades.map((t) => t.entryTime.slice(0, 10))).size;

  return {
    totalPnl: parseFloat(totalPnl.toFixed(2)),
    winRate: parseFloat(((wins.length / trades.length) * 100).toFixed(1)),
    profitFactor: parseFloat((totalWins / (totalLosses || 1)).toFixed(2)),
    avgWin: wins.length ? parseFloat((totalWins / wins.length).toFixed(2)) : 0,
    avgLoss: losses.length ? parseFloat((-(totalLosses / losses.length)).toFixed(2)) : 0,
    avgRR: parseFloat((trades.reduce((s, t) => s + t.rMultiple, 0) / trades.length).toFixed(2)),
    maxDrawdown: parseFloat(maxDD.toFixed(2)),
    maxDrawdownPercent: parseFloat(maxDD.toFixed(2)),
    totalTrades: trades.length,
    winTrades: wins.length,
    lossTrades: losses.length,
    breakevenTrades: trades.filter((t) => t.status === 'BREAKEVEN').length,
    bestTrade: Math.max(...trades.map((t) => t.pnl)),
    worstTrade: Math.min(...trades.map((t) => t.pnl)),
    avgHoldTime: parseFloat((trades.reduce((s, t) => s + t.duration, 0) / trades.length).toFixed(0)),
    maxConsecutiveWins: maxWinStreak,
    maxConsecutiveLosses: maxLossStreak,
    sharpeRatio: parseFloat((totalPnl / (maxDD * 100 || 1)).toFixed(2)),
    expectancy: parseFloat(
      (
        (wins.length / trades.length) * (totalWins / wins.length || 0) -
        (losses.length / trades.length) * (totalLosses / losses.length || 0)
      ).toFixed(2)
    ),
    avgDailyPnl: parseFloat((totalPnl / Math.max(uniqueDays, 1)).toFixed(2)),
    tradingDays: uniqueDays,
  };
}
