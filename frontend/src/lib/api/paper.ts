import { apiFetch, detailMessage } from './client';

export type PaperAccountRow = {
  id: string;
  name: string;
  currency: string;
  balance: number;
  equity: number;
  max_daily_loss: number;
  max_risk_per_trade_percent: number;
  created_at: string | null;
};

export async function listPaperAccounts(): Promise<PaperAccountRow[]> {
  const { ok, data } = await apiFetch<{ accounts?: PaperAccountRow[] }>('/paper/accounts');
  if (!ok) throw new Error(detailMessage(data));
  return data.accounts ?? [];
}

export async function createPaperAccount(body: {
  name?: string;
  starting_balance: number;
  max_daily_loss: number;
  max_risk_per_trade_percent: number;
}): Promise<PaperAccountRow> {
  const { ok, data } = await apiFetch<PaperAccountRow>('/paper/accounts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}
