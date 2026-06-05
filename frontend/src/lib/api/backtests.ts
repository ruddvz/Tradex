import { apiFetch, detailMessage } from './client';

export type BacktestSummary = {
  id: string;
  name: string;
  symbol: string;
  status: string;
  net_pnl?: number | null;
  return_pct?: number | null;
  trade_count?: number | null;
  data_label?: string | null;
  created_at?: string | null;
};

export type BacktestDetail = BacktestSummary & {
  metrics: Record<string, number>;
  in_sample_metrics?: Record<string, number> | null;
  out_of_sample_metrics?: Record<string, number> | null;
  assumptions: Record<string, unknown>;
  data_label: string;
  trust_warnings: string[];
  oos_warnings?: string[];
  candle_count?: number | null;
};

export type CandleDataset = {
  id: string;
  symbol: string;
  filename?: string | null;
  candle_count: number;
  date_start?: string | null;
  date_end?: string | null;
  created_at?: string | null;
};

export type BacktestTrade = {
  entry_time: string;
  exit_time: string;
  symbol: string;
  direction: string;
  entry_price: number;
  exit_price: number;
  pnl: number;
  r_multiple: number;
};

export type BacktestCreateInput = {
  name: string;
  symbol?: string;
  candle_dataset_id?: string;
  lookback?: number;
  rr_target?: number;
  stop_pips?: number;
  spread_pips?: number;
  slippage_pips?: number;
  lot_size?: number;
};

export async function fetchBacktests(): Promise<BacktestSummary[]> {
  const { ok, data } = await apiFetch<BacktestSummary[]>('/backtests');
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}

export async function fetchCandleDatasets(): Promise<CandleDataset[]> {
  const { ok, data } = await apiFetch<CandleDataset[]>('/backtests/candle-datasets');
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}

export async function uploadCandleCsv(file: File, symbol: string): Promise<CandleDataset> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('symbol', symbol);
  const { ok, data } = await apiFetch<CandleDataset>('/backtests/candle-datasets', {
    method: 'POST',
    body: fd,
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function createBacktest(input: BacktestCreateInput): Promise<BacktestDetail> {
  const { ok, data } = await apiFetch<BacktestDetail>('/backtests', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      symbol: input.symbol ?? 'EURUSD',
      candle_dataset_id: input.candle_dataset_id,
      rules: {
        lookback: input.lookback ?? 12,
        rr_target: input.rr_target ?? 2,
        stop_pips: input.stop_pips ?? 15,
      },
      spread_pips: input.spread_pips ?? 1.2,
      slippage_pips: input.slippage_pips ?? 0.5,
      lot_size: input.lot_size ?? 0.1,
    }),
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function fetchBacktestDetail(id: string): Promise<BacktestDetail> {
  const { ok, data } = await apiFetch<BacktestDetail>(`/backtests/${id}`);
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function fetchBacktestTrades(id: string): Promise<BacktestTrade[]> {
  const { ok, data } = await apiFetch<BacktestTrade[]>(`/backtests/${id}/trades`);
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}

export async function fetchBacktestEquity(id: string): Promise<{ date: string; equity: number }[]> {
  const { ok, data } = await apiFetch<{ date: string; equity: number }[]>(
    `/backtests/${id}/equity-curve`
  );
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}

export async function deleteBacktest(id: string): Promise<void> {
  const { ok, data } = await apiFetch(`/backtests/${id}`, { method: 'DELETE' });
  if (!ok) throw new Error(detailMessage(data));
}
