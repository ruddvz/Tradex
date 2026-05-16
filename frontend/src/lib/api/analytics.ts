import { apiFetch, detailMessage } from './client';
import type { PerformanceMetrics, CalendarDay } from '../../types';

export async function fetchMetrics(accountId?: string | null): Promise<PerformanceMetrics> {
  const sp = new URLSearchParams();
  if (accountId) sp.set('account_id', accountId);
  const qs = sp.toString();
  const { ok, data } = await apiFetch<PerformanceMetrics>(`/analytics/metrics${qs ? `?${qs}` : ''}`);
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function fetchSymbolStats(accountId?: string | null) {
  const sp = new URLSearchParams();
  if (accountId) sp.set('account_id', accountId);
  const qs = sp.toString();
  const { ok, data } = await apiFetch<unknown[]>(`/analytics/symbols${qs ? `?${qs}` : ''}`);
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function fetchSessionStats(accountId?: string | null) {
  const sp = new URLSearchParams();
  if (accountId) sp.set('account_id', accountId);
  const qs = sp.toString();
  const { ok, data } = await apiFetch<unknown[]>(`/analytics/sessions${qs ? `?${qs}` : ''}`);
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function fetchPsychologyStats(accountId?: string | null) {
  const sp = new URLSearchParams();
  if (accountId) sp.set('account_id', accountId);
  const qs = sp.toString();
  const { ok, data } = await apiFetch<unknown[]>(`/analytics/psychology${qs ? `?${qs}` : ''}`);
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function fetchCalendar(days = 90, accountId?: string | null): Promise<CalendarDay[]> {
  const sp = new URLSearchParams({ days: String(days) });
  if (accountId) sp.set('account_id', accountId);
  const { ok, data } = await apiFetch<CalendarDay[]>(`/analytics/calendar?${sp.toString()}`);
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}
