import type { Trade, DailyStats, PerformanceMetrics, PropFirmChallenge, Playbook, NotebookEntry, AIInsight, Account, CalendarDay, EquityPoint } from '../types';
import { subDays, format, addMinutes } from 'date-fns';

const symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100', 'GBPJPY', 'AUDUSD'];
const strategies = ['Breakout', 'Mean Reversion', 'Trend Follow', 'Supply/Demand', 'ICT', 'SMC', 'Scalp', 'Swing'];
const sessions = ['London', 'New York', 'Tokyo', 'Overlap'] as const;
const emotions = ['Confident', 'Focused', 'Calm', 'Anxious', 'FOMO', 'Neutral', 'Patient', 'Excited'] as const;
const brokers = ['Exness', 'IC Markets', 'XM', 'Pepperstone', 'FTMO'];

function randomBetween(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

export function generateTrades(count = 120): Trade[] {
  const trades: Trade[] = [];
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(pseudoRandom() * 90);
    const entryDate = subDays(new Date(), daysAgo);
    const direction = pseudoRandom() > 0.45 ? 'BUY' : 'SELL';
    const symbol = symbols[Math.floor(pseudoRandom() * symbols.length)];
    const isGold = symbol === 'XAUUSD';
    const isIndex = symbol.includes('US');
    const basePrice = isGold ? 2350 : isIndex ? 38000 : 1.1;
    const priceRange = isGold ? 20 : isIndex ? 200 : 0.005;
    const entryPrice = basePrice + pseudoRandom() * priceRange;
    const isWin = pseudoRandom() > 0.38;
    const pnlRange = isWin ? randomBetween(50, 800) : -randomBetween(30, 400);
    const pnl = parseFloat((pnlRange * (1 + pseudoRandom() * 0.3)).toFixed(2));
    const rr = isWin ? randomBetween(1.5, 4.5) : randomBetween(0.3, 0.9);
    const exitPrice = direction === 'BUY' 
      ? entryPrice + (isWin ? priceRange * 0.4 : -priceRange * 0.2)
      : entryPrice - (isWin ? priceRange * 0.4 : -priceRange * 0.2);
    const durationMin = Math.floor(pseudoRandom() * 240) + 15;
    const strategy = strategies[Math.floor(pseudoRandom() * strategies.length)];
    const emotion = emotions[Math.floor(pseudoRandom() * emotions.length)];
    const session = sessions[Math.floor(pseudoRandom() * sessions.length)];
    const grade = pnl > 300 ? 'A' : pnl > 100 ? 'B' : pnl > 0 ? 'C' : pnl > -100 ? 'D' : 'F';

    trades.push({
      id: `trade-${i + 1}`,
      symbol,
      direction,
      entryPrice: parseFloat(entryPrice.toFixed(isGold ? 2 : isIndex ? 0 : 5)),
      exitPrice: parseFloat(exitPrice.toFixed(isGold ? 2 : isIndex ? 0 : 5)),
      lotSize: parseFloat((pseudoRandom() * 1.5 + 0.1).toFixed(2)),
      entryTime: format(entryDate, "yyyy-MM-dd'T'HH:mm:ss"),
      exitTime: format(addMinutes(entryDate, durationMin), "yyyy-MM-dd'T'HH:mm:ss"),
      pnl,
      pnlPercent: parseFloat((pnl / 10000 * 100).toFixed(2)),
      rMultiple: parseFloat(rr.toFixed(2)),
      stopLoss: direction === 'BUY' ? entryPrice - priceRange * 0.2 : entryPrice + priceRange * 0.2,
      takeProfit: direction === 'BUY' ? entryPrice + priceRange * 0.5 : entryPrice - priceRange * 0.5,
      strategy,
      session,
      emotion,
      emotionScore: Math.floor(pseudoRandom() * 5) + 6,
      notes: i % 4 === 0 ? `Clean setup on ${symbol}. ${isWin ? 'Followed plan perfectly.' : 'Exited early due to volatility.'}` : '',
      tags: [strategy.toLowerCase(), symbol.toLowerCase(), session.toLowerCase()],
      duration: durationMin,
      commission: parseFloat((pseudoRandom() * 3 + 1).toFixed(2)),
      swap: parseFloat((pseudoRandom() * 2 - 1).toFixed(2)),
      status: pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BREAKEVEN',
      grade,
      riskReward: parseFloat(rr.toFixed(2)),
      maxDrawdown: parseFloat((pseudoRandom() * 50).toFixed(2)),
      setup: strategy,
      broker: brokers[Math.floor(pseudoRandom() * brokers.length)] as string,
      account: 'PRO-10042',
    });
  }

  return trades.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
}

export const mockTrades = generateTrades(120);

export function computeMetrics(trades: Trade[]): PerformanceMetrics {
  const wins = trades.filter(t => t.status === 'WIN');
  const losses = trades.filter(t => t.status === 'LOSS');
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const totalWins = wins.reduce((s, t) => s + t.pnl, 0);
  const totalLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  
  // Calculate equity curve and max drawdown
  let peak = 10000;
  let equity = 10000;
  let maxDD = 0;
  for (const t of [...trades].reverse()) {
    equity += t.pnl;
    if (equity > peak) peak = equity;
    const dd = (peak - equity) / peak * 100;
    if (dd > maxDD) maxDD = dd;
  }

  let maxWinStreak = 0, maxLossStreak = 0;
  let curWin = 0, curLoss = 0;
  for (const t of [...trades].reverse()) {
    if (t.status === 'WIN') { curWin++; curLoss = 0; maxWinStreak = Math.max(maxWinStreak, curWin); }
    else { curLoss++; curWin = 0; maxLossStreak = Math.max(maxLossStreak, curLoss); }
  }

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
    breakevenTrades: trades.filter(t => t.status === 'BREAKEVEN').length,
    bestTrade: Math.max(...trades.map(t => t.pnl)),
    worstTrade: Math.min(...trades.map(t => t.pnl)),
    avgHoldTime: parseFloat((trades.reduce((s, t) => s + t.duration, 0) / trades.length).toFixed(0)),
    maxConsecutiveWins: maxWinStreak,
    maxConsecutiveLosses: maxLossStreak,
    sharpeRatio: parseFloat((totalPnl / (maxDD * 100 || 1)).toFixed(2)),
    expectancy: parseFloat(((wins.length / trades.length * (totalWins / wins.length || 0)) - (losses.length / trades.length * (totalLosses / losses.length || 0))).toFixed(2)),
    avgDailyPnl: parseFloat((totalPnl / 90).toFixed(2)),
    tradingDays: 90,
  };
}

export const mockMetrics = computeMetrics(mockTrades);

export function generateEquityCurve(): EquityPoint[] {
  const points: EquityPoint[] = [];
  let equity = 10000;
  let balance = 10000;
  let peak = 10000;
  
  const tradesByDay = new Map<string, Trade[]>();
  mockTrades.forEach(t => {
    const day = t.entryTime.split('T')[0];
    if (!tradesByDay.has(day)) tradesByDay.set(day, []);
    tradesByDay.get(day)!.push(t);
  });

  for (let i = 89; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const dayTrades = tradesByDay.get(date) || [];
    const dayPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
    equity += dayPnl;
    balance += dayPnl * 0.95;
    if (equity > peak) peak = equity;
    const drawdown = (peak - equity) / peak * 100;
    points.push({ date, equity: parseFloat(equity.toFixed(2)), balance: parseFloat(balance.toFixed(2)), drawdown: parseFloat(drawdown.toFixed(2)) });
  }
  return points;
}

export function generateCalendar(): CalendarDay[] {
  const days: CalendarDay[] = [];
  const tradesByDay = new Map<string, Trade[]>();
  mockTrades.forEach(t => {
    const day = t.entryTime.split('T')[0];
    if (!tradesByDay.has(day)) tradesByDay.set(day, []);
    tradesByDay.get(day)!.push(t);
  });

  for (let i = 89; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const dayTrades = tradesByDay.get(date) || [];
    days.push({
      date,
      pnl: parseFloat(dayTrades.reduce((s, t) => s + t.pnl, 0).toFixed(2)),
      trades: dayTrades.length,
      isTrading: dayTrades.length > 0,
    });
  }
  return days;
}

export const mockEquityCurve = generateEquityCurve();
export const mockCalendar = generateCalendar();

export const mockDailyStats: DailyStats[] = mockCalendar
  .filter(d => d.isTrading)
  .slice(-30)
  .map(d => ({
    date: d.date,
    pnl: d.pnl,
    trades: d.trades,
    winRate: 65,
    bestTrade: d.pnl * 0.6,
    worstTrade: d.pnl * -0.3,
  }));

export const mockPropChallenge: PropFirmChallenge = {
  id: 'challenge-1',
  name: 'FTMO 100K Challenge',
  firm: 'FTMO',
  accountSize: 100000,
  profitTarget: 8000,
  maxDrawdown: 10000,
  dailyDrawdown: 5000,
  minTradingDays: 10,
  startDate: format(subDays(new Date(), 12), 'yyyy-MM-dd'),
  endDate: format(subDays(new Date(), -18), 'yyyy-MM-dd'),
  currentPnl: 5240,
  currentDrawdown: 3120,
  dailyLoss: 820,
  status: 'active',
  phase: 'phase1',
  trades: 47,
  daysTraded: 12,
};

export const mockPlaybooks: Playbook[] = [
  {
    id: 'pb-1', name: 'Breakout Strategy', type: 'strategy',
    winRate: 66, trades: 47, profit: 8400, profitFactor: 3.7, avgRR: 2.8,
    description: 'High-probability breakout setups on key structural levels with volume confirmation.',
    rules: ['Wait for clean break and retest', 'Volume must confirm breakout', 'Only trade in direction of higher TF trend', 'Set SL below structure', 'Minimum 1:2 RR'],
    tags: ['breakout', 'momentum', 'structure'],
    performance: Array.from({ length: 20 }, (_, i) => ({ date: format(subDays(new Date(), 20 - i), 'yyyy-MM-dd'), pnl: Math.random() * 600 - 150 })),
    createdAt: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
  },
  {
    id: 'pb-2', name: 'XAUUSD London Open', type: 'symbol',
    winRate: 71, trades: 38, profit: 6200, profitFactor: 4.1, avgRR: 3.2,
    description: 'Gold trading during London open session with liquidity sweeps.',
    rules: ['Trade only 08:00-10:00 GMT', 'Look for Asia range liquidity sweep', 'SMC order block entry', 'Target previous session high/low'],
    tags: ['gold', 'london', 'liquidity'],
    performance: Array.from({ length: 20 }, (_, i) => ({ date: format(subDays(new Date(), 20 - i), 'yyyy-MM-dd'), pnl: Math.random() * 500 - 100 })),
    createdAt: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
  },
  {
    id: 'pb-3', name: 'NY Session Scalp', type: 'session',
    winRate: 68, trades: 29, profit: 4200, profitFactor: 2.9, avgRR: 2.1,
    description: 'Quick scalps during New York open volatility.',
    rules: ['Trade 13:30-15:00 GMT only', 'Must have news catalyst', 'Max 30 minute hold time', 'Hard SL always in place'],
    tags: ['scalp', 'new-york', 'volatility'],
    performance: Array.from({ length: 20 }, (_, i) => ({ date: format(subDays(new Date(), 20 - i), 'yyyy-MM-dd'), pnl: Math.random() * 400 - 120 })),
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  },
  {
    id: 'pb-4', name: 'Supply/Demand Swing', type: 'pattern',
    winRate: 74, trades: 24, profit: 3900, profitFactor: 3.4, avgRR: 3.8,
    description: 'Weekly swing trades from major supply and demand zones.',
    rules: ['Only D1/W1 timeframe levels', 'Zone must be fresh (untested)', 'Confirmation on H4/H1', 'Target minimum next S/D zone'],
    tags: ['supply-demand', 'swing', 'weekly'],
    performance: Array.from({ length: 20 }, (_, i) => ({ date: format(subDays(new Date(), 20 - i), 'yyyy-MM-dd'), pnl: Math.random() * 700 - 100 })),
    createdAt: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
  },
];

export const mockNotebook: NotebookEntry[] = [
  {
    id: 'note-1', title: 'Trading Rules - Core Principles', type: 'rule',
    content: `# Non-Negotiable Trading Rules

1. **Never risk more than 1% per trade**
2. **Always use a stop loss** — no exceptions
3. **Don't trade during high-impact news** unless the setup is perfect
4. **Max 3 losses in a row** → stop for the day
5. **Review every trade** within 24 hours
6. **No revenge trading** after a loss

These rules exist to protect my capital and emotional state.`,
    tags: ['rules', 'discipline', 'risk'], pinned: true,
    createdAt: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
  },
  {
    id: 'note-2', title: 'XAUUSD Trading Bible', type: 'setup',
    content: `# Gold Trading Setup Guide

## Best Times
- London Open: 08:00-10:00 GMT (Best)
- NY Open: 13:30-15:30 GMT (Good)
- Avoid: Asian session (choppy)

## Key Levels
- Watch for liquidity sweeps above/below Asia range
- Major psychological levels: round numbers (2300, 2350, 2400)
- Weekly highs/lows are magnetic

## Entry Triggers
- BMS (Break of Market Structure) on H1/M15
- Order block + FVG combination
- Volume spike confirmation`,
    tags: ['gold', 'xauusd', 'setup', 'ict'], pinned: true,
    createdAt: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  },
  {
    id: 'note-3', title: 'Psychology Lessons', type: 'lesson',
    content: `# Trading Psychology Notes

## Lessons Learned
- FOMO leads to late entries → wait for pullback
- After 2 wins, I tend to overtrade → take a break
- Monday morning setups are usually traps
- Calm confidence = best trades; excited = worst

## Daily Affirmations
- The market will always be there tomorrow
- I only need 3-5 good trades per week
- Process over outcome`,
    tags: ['psychology', 'mindset', 'lessons'], pinned: false,
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
  },
];

export const mockAIInsights: AIInsight[] = [
  {
    id: 'ai-1', type: 'pattern', impact: 'high',
    title: 'Tuesday is Your Best Trading Day',
    description: 'Analysis of 120 trades shows you perform 43% better on Tuesdays vs other days. Win rate: 74% vs average 65%. Your best setups align with Tuesday institutional flow.',
    action: 'Prioritize trade quality on Tuesdays. Consider increasing position size by 25%.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ai-2', type: 'warning', impact: 'high',
    title: 'Post-Loss Behavior Alert',
    description: 'After 2 consecutive losses, your next trade win rate drops to 41%. You show signs of revenge trading — larger lot sizes and faster entries within 30 minutes.',
    action: 'Implement a mandatory 2-hour break after 2 consecutive losses.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ai-3', type: 'opportunity', impact: 'medium',
    title: 'XAUUSD London Open Edge Detected',
    description: 'Your XAUUSD trades during London open (08:00-10:00 GMT) show a 71% win rate and 4.1 profit factor — significantly above your overall average.',
    action: 'Focus more capital and attention on XAUUSD London open setups.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ai-4', type: 'psychology', impact: 'medium',
    title: 'Emotional Trading Correlation',
    description: 'Trades tagged "FOMO" or "Anxious" result in 23% win rate. Trades tagged "Calm" or "Patient" show 78% win rate. Your emotional state is your biggest performance variable.',
    action: 'Add a pre-trade emotion check. Only enter trades when feeling calm/focused.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ai-5', type: 'achievement', impact: 'low',
    title: '10-Trade Win Streak Achieved!',
    description: 'You just completed your longest win streak of 10 consecutive profitable trades. Your average RR during this streak was 3.2.',
    action: 'Document this period in your notebook to replicate the conditions.',
    createdAt: new Date().toISOString(),
  },
];

export const mockAccount: Account = {
  id: 'acc-1', name: 'Pro Live Account', broker: 'Exness',
  balance: 12453.20, equity: 12892.50, currency: 'USD',
  type: 'live', connected: true, lastSync: new Date().toISOString(),
};
