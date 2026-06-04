import { apiFetch, detailMessage } from './client';

export type StrategyRunRow = {
  id: string;
  strategy_id?: string | null;
  paper_account_id: string;
  mode: string;
  status: string;
  started_at?: string | null;
  stopped_at?: string | null;
  config: Record<string, unknown>;
  summary: Record<string, number>;
};

export type StrategyEventRow = {
  id: string;
  event_type: string;
  severity: string;
  message: string;
  created_at?: string | null;
};

export type StrategyRow = {
  id: string;
  name: string;
  symbol: string;
  rules: Record<string, unknown>;
};

export async function fetchStrategies(): Promise<StrategyRow[]> {
  const { ok, data } = await apiFetch<StrategyRow[]>('/backtests/strategies');
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}

export async function createStrategy(body: {
  name: string;
  symbol?: string;
  rules?: Record<string, unknown>;
}): Promise<StrategyRow> {
  const { ok, data } = await apiFetch<StrategyRow>('/backtests/strategies', {
    method: 'POST',
    body: JSON.stringify({
      name: body.name,
      symbol: body.symbol ?? 'EURUSD',
      rules: body.rules ?? { lot_size: 0.01, stop_pips: 15, rr_target: 2 },
    }),
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function fetchStrategyRuns(): Promise<StrategyRunRow[]> {
  const { ok, data } = await apiFetch<StrategyRunRow[]>('/strategy-runs');
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}

export async function startStrategyRun(body: {
  strategy_id: string;
  paper_account_id: string;
}): Promise<StrategyRunRow> {
  const { ok, data } = await apiFetch<StrategyRunRow>('/strategy-runs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function tickStrategyRun(runId: string): Promise<Record<string, unknown>> {
  const { ok, data } = await apiFetch<Record<string, unknown>>(`/strategy-runs/${runId}/tick`, {
    method: 'POST',
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function pauseStrategyRun(runId: string): Promise<StrategyRunRow> {
  const { ok, data } = await apiFetch<StrategyRunRow>(`/strategy-runs/${runId}/pause`, {
    method: 'POST',
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function stopStrategyRun(runId: string): Promise<StrategyRunRow> {
  const { ok, data } = await apiFetch<StrategyRunRow>(`/strategy-runs/${runId}/stop`, {
    method: 'POST',
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function fetchStrategyRunEvents(runId: string): Promise<StrategyEventRow[]> {
  const { ok, data } = await apiFetch<StrategyEventRow[]>(`/strategy-runs/${runId}/events`);
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}
