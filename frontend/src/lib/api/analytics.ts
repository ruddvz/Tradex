import { apiFetch, detailMessage } from './client';
import type { CalendarDay, PerformanceMetrics } from '../../types';
import {
  analyticsQueryParams,
  mapAnalyticsToMetrics,
  mapCalendarRows,
  mapDailyPnlFromMetrics,
  mapEquityCurveFromMetrics,
  type DailyPnlPoint,
  type EquityPoint,
} from '../mapAnalytics';

export type AnalyticsBundle = {
  metrics: PerformanceMetrics;
  equityCurve: EquityPoint[];
  dailyPnl: DailyPnlPoint[];
};

export async function fetchAnalyticsBundle(
  range: '7d' | '30d' | '90d' | 'all',
  accountId?: string | null
): Promise<AnalyticsBundle> {
  const qs = analyticsQueryParams(range, accountId);
  const path = `/analytics/metrics${qs ? `?${qs}` : ''}`;
  const { ok, data } = await apiFetch<Record<string, unknown>>(path);
  if (!ok) throw new Error(detailMessage(data));
  const row = (data ?? {}) as Record<string, unknown>;
  return {
    metrics: mapAnalyticsToMetrics(row),
    equityCurve: mapEquityCurveFromMetrics(row),
    dailyPnl: mapDailyPnlFromMetrics(row),
  };
}

export async function fetchMetrics(
  accountId?: string | null,
  range: '7d' | '30d' | '90d' | 'all' = 'all'
): Promise<PerformanceMetrics> {
  const bundle = await fetchAnalyticsBundle(range, accountId);
  return bundle.metrics;
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

export async function fetchCalendar(
  days = 90,
  accountId?: string | null,
  range?: '7d' | '30d' | '90d' | 'all'
): Promise<CalendarDay[]> {
  const sp = new URLSearchParams();
  if (range && range !== 'all') {
    const rangeQs = analyticsQueryParams(range, accountId);
    rangeQs.split('&').forEach((pair) => {
      const [k, v] = pair.split('=');
      if (k && v) sp.set(k, decodeURIComponent(v));
    });
  } else {
    sp.set('days', String(days));
    if (accountId) sp.set('account_id', accountId);
  }
  const { ok, data } = await apiFetch<unknown[]>(`/analytics/calendar?${sp.toString()}`);
  if (!ok) throw new Error(detailMessage(data));
  return mapCalendarRows(data);
}
