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

export type PaperOrderRow = {
  id: string;
  paper_account_id: string;
  symbol: string;
  side: string;
  order_type: string;
  status: string;
  requested_price: number;
  filled_avg_price?: number | null;
  lot_size: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  rejection_reason?: string | null;
  created_at?: string | null;
  filled_at?: string | null;
};

export type PaperPositionRow = {
  id: string;
  paper_account_id: string;
  symbol: string;
  side: string;
  lot_size: number;
  avg_entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  realized_pnl: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  status: string;
  opened_at?: string | null;
  closed_at?: string | null;
};

export type PaperFillRow = {
  id: string;
  paper_order_id: string;
  paper_position_id?: string | null;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  slippage: number;
  spread: number;
  commission: number;
  filled_at?: string | null;
};

export async function listPaperOrders(paperAccountId: string): Promise<PaperOrderRow[]> {
  const { ok, data } = await apiFetch<PaperOrderRow[]>(
    `/paper/orders?paper_account_id=${encodeURIComponent(paperAccountId)}`
  );
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}

export async function createPaperOrder(body: {
  paper_account_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  lot_size: number;
  reference_price: number;
  stop_loss: number;
  take_profit?: number;
}): Promise<{
  order: PaperOrderRow;
  position: PaperPositionRow | null;
  error?: string;
}> {
  const { ok, data } = await apiFetch<{
    order: PaperOrderRow;
    position: PaperPositionRow | null;
    error?: string;
  }>('/paper/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function listPaperPositions(
  paperAccountId: string,
  status?: 'open' | 'closed'
): Promise<PaperPositionRow[]> {
  const q = new URLSearchParams({ paper_account_id: paperAccountId });
  if (status) q.set('status', status);
  const { ok, data } = await apiFetch<PaperPositionRow[]>(`/paper/positions?${q}`);
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}

export async function closePaperPosition(
  positionId: string,
  exitPrice: number
): Promise<{ position: PaperPositionRow; journal_trade?: Record<string, unknown> }> {
  const { ok, data } = await apiFetch<{
    position: PaperPositionRow;
    journal_trade?: Record<string, unknown>;
  }>(`/paper/positions/${positionId}/close`, {
    method: 'POST',
    body: JSON.stringify({ exit_price: exitPrice }),
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function listPaperFills(paperAccountId: string): Promise<PaperFillRow[]> {
  const { ok, data } = await apiFetch<PaperFillRow[]>(
    `/paper/fills?paper_account_id=${encodeURIComponent(paperAccountId)}`
  );
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}
