import type { Trade } from '../types';

/** Map FastAPI `trade_to_api_dict` snake_case JSON into frontend `Trade`. */
export function mapApiTradeRow(row: Record<string, unknown>): Trade {
  const sessionRaw = String(row.session ?? 'London');
  const allowed = ['London', 'New York', 'Tokyo', 'Sydney', 'Overlap'] as const;
  const session = (
    allowed.includes(sessionRaw as (typeof allowed)[number]) ? sessionRaw : 'London'
  ) as Trade['session'];

  return {
    id: String(row.id),
    symbol: String(row.symbol ?? ''),
    direction: String(row.direction) === 'SELL' ? 'SELL' : 'BUY',
    entryPrice: Number(row.entry_price ?? 0),
    exitPrice: Number(row.exit_price ?? 0),
    lotSize: Number(row.lot_size ?? 0),
    entryTime: String(row.entry_time ?? ''),
    exitTime: String(row.exit_time ?? ''),
    pnl: Number(row.pnl ?? 0),
    pnlPercent: Number(row.pnl_percent ?? 0),
    rMultiple: Number(row.r_multiple ?? 0),
    stopLoss: Number(row.stop_loss ?? 0),
    takeProfit: Number(row.take_profit ?? 0),
    strategy: String(row.strategy ?? ''),
    session,
    emotion: String(row.emotion ?? 'Neutral') as Trade['emotion'],
    emotionScore: Number(row.emotion_score ?? 5),
    notes: String(row.notes ?? ''),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    duration: Number(row.duration ?? 0),
    commission: Number(row.commission ?? 0),
    swap: Number(row.swap ?? 0),
    status: String(row.status ?? 'BREAKEVEN') as Trade['status'],
    grade: String(row.grade ?? 'C') as Trade['grade'],
    riskReward: Number(row.risk_reward ?? 0),
    maxDrawdown: Number(row.max_drawdown ?? 0),
    setup: String(row.setup ?? ''),
    broker: String(row.broker ?? ''),
    account: String(row.account_id ?? ''),
    source: typeof row.source === 'string' ? row.source : 'manual',
    screenshot:
      typeof row.screenshot_url === 'string' ? row.screenshot_url : undefined,
    screenshotBeforeUrl:
      typeof row.screenshot_before_url === 'string'
        ? row.screenshot_before_url
        : undefined,
    screenshotAfterUrl:
      typeof row.screenshot_after_url === 'string'
        ? row.screenshot_after_url
        : undefined,
  };
}
