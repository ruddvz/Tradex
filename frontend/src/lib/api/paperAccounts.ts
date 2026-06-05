import type { PaperAccount } from '../../types';
import { apiJson } from './client';

export function mapPaperAccountRow(row: Record<string, unknown>): PaperAccount {
  const starting = Number(row.starting_balance ?? 0);
  return {
    id: String(row.id ?? ''),
    userId: String(row.user_id ?? ''),
    name: String(row.name ?? ''),
    currency: String(row.currency ?? 'USD'),
    startingBalance: starting,
    balance: Number(row.balance ?? starting),
    equity: Number(row.equity ?? starting),
    maxDailyLoss: Number(row.max_daily_loss ?? 500),
    maxRiskPerTradePercent: Number(row.max_risk_per_trade_percent ?? 1),
    fillSpreadMultiplier: Number(row.fill_spread_multiplier ?? 1),
    fillSlippageFactor: Number(row.fill_slippage_factor ?? 0.5),
    fillCommissionPerLot: Number(row.fill_commission_per_lot ?? 3.5),
    isActive: Boolean(row.is_active ?? true),
    createdAt: String(row.created_at ?? '').slice(0, 19).replace(' ', 'T'),
  };
}

export async function fetchPaperAccounts(): Promise<PaperAccount[]> {
  const rows = await apiJson<Record<string, unknown>[]>('/paper-accounts');
  if (!Array.isArray(rows)) return [];
  return rows.map(r => mapPaperAccountRow(r));
}

export async function createPaperAccount(body: {
  name?: string;
  currency?: string;
  starting_balance?: number;
  max_daily_loss?: number;
  max_risk_per_trade_percent?: number;
  is_active?: boolean;
}): Promise<PaperAccount> {
  const row = await apiJson<Record<string, unknown>>('/paper-accounts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return mapPaperAccountRow(row);
}
