import { apiFetch, detailMessage } from './client';
import type { PropFirmChallenge } from '../../types';

function mapChallenge(row: Record<string, unknown>): PropFirmChallenge {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    firm: String(row.firm ?? ''),
    accountSize: Number(row.account_size ?? 0),
    profitTarget: Number(row.profit_target ?? 0),
    maxDrawdown: Number(row.max_drawdown ?? 0),
    dailyDrawdown: Number(row.daily_drawdown ?? 0),
    minTradingDays: Number(row.min_trading_days ?? 0),
    startDate: String(row.start_date ?? ''),
    endDate: String(row.end_date ?? ''),
    currentPnl: Number(row.current_pnl ?? 0),
    currentDrawdown: Number(row.current_drawdown ?? 0),
    dailyLoss: Number(row.daily_loss ?? 0),
    status: (String(row.status ?? 'active') as PropFirmChallenge['status']) || 'active',
    phase: 'phase1',
    trades: Number(row.trades ?? 0),
    daysTraded: Number(row.days_traded ?? 0),
  };
}

export async function fetchChallenges(): Promise<PropFirmChallenge[]> {
  const { ok, data } = await apiFetch<{ challenges?: Record<string, unknown>[] }>('/challenges');
  if (!ok) throw new Error(detailMessage(data));
  return (data.challenges ?? []).map((r) => mapChallenge(r));
}
