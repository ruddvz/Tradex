import { apiFetch, detailMessage } from './client';
import type { AIInsight } from '../../types';

export async function fetchAiInsights(accountId?: string | null): Promise<AIInsight[]> {
  const sp = new URLSearchParams();
  if (accountId) sp.set('account_id', accountId);
  const qs = sp.toString();
  const { ok, data } = await apiFetch<{ insights?: AIInsight[] }>(
    `/ai/insights${qs ? `?${qs}` : ''}`,
    { method: 'POST' }
  );
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data.insights) ? data.insights : [];
}
