import { apiFetch, detailMessage } from './client';

export type RiskProfileRow = {
  id: string;
  name: string;
  max_risk_per_trade_percent: number;
  max_daily_loss_percent: number;
  max_open_positions: number;
  max_positions_per_symbol: number;
  require_stop_loss: boolean;
};

export type AuditEventRow = {
  id: string;
  event_type: string;
  severity: string;
  message: string;
  entity_type: string;
  entity_id?: string | null;
  created_at?: string | null;
};

export async function fetchRiskProfiles(): Promise<RiskProfileRow[]> {
  const { ok, data } = await apiFetch<RiskProfileRow[]>('/risk/profiles');
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}

export async function fetchRiskEvents(limit = 20): Promise<AuditEventRow[]> {
  const { ok, data } = await apiFetch<AuditEventRow[]>(`/risk/events?limit=${limit}`);
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}
