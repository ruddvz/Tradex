import { apiFetch, detailMessage } from './client';
import type { Trade } from '../../types';
import { mapApiTradeRow } from '../mapApiTrade';

export async function fetchTrades(params?: {
  accountId?: string | null;
  limit?: number;
}): Promise<{ trades: Trade[]; total: number }> {
  const sp = new URLSearchParams();
  if (params?.accountId) sp.set('account_id', params.accountId);
  if (params?.limit) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  const path = `/trades${qs ? `?${qs}` : ''}`;
  const { ok, data } = await apiFetch<{ trades?: Record<string, unknown>[]; total?: number }>(path);
  if (!ok) throw new Error(detailMessage(data));
  const rows = Array.isArray(data.trades) ? data.trades : [];
  return {
    trades: rows.map((r) => mapApiTradeRow(r)),
    total: typeof data.total === 'number' ? data.total : rows.length,
  };
}

export type CreateTradePayload = {
  symbol: string;
  direction: string;
  entry_price: number;
  exit_price?: number;
  lot_size: number;
  entry_time: string;
  exit_time?: string;
  pnl: number;
  stop_loss?: number;
  take_profit?: number;
  strategy?: string;
  setup?: string;
  session?: string;
  emotion?: string;
  emotion_score?: number;
  notes?: string;
  tags?: string[];
  duration?: number;
  commission?: number;
  swap?: number;
  account_id?: string | null;
};

export async function createTradeApi(body: CreateTradePayload): Promise<Trade> {
  const { ok, data } = await apiFetch<Record<string, unknown>>('/trades', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!ok) throw new Error(detailMessage(data));
  return mapApiTradeRow(data);
}

export async function deleteTradeApi(id: string): Promise<void> {
  const { ok, data } = await apiFetch(`/trades/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!ok) throw new Error(detailMessage(data));
}
