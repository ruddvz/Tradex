import { apiFetch, detailMessage } from './client';

export type TradingAccountRow = {
  id: string;
  name: string;
  broker: string | null;
  account_type: string;
  base_currency: string;
  starting_balance: number;
  current_balance: number;
  current_equity: number;
  risk_per_trade_default: number;
  max_daily_loss: number | null;
  max_total_drawdown: number | null;
  created_at: string | null;
};

export async function listTradingAccounts(): Promise<TradingAccountRow[]> {
  const { ok, data } = await apiFetch<{ accounts?: TradingAccountRow[] }>('/accounts');
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data.accounts) ? data.accounts : [];
}
