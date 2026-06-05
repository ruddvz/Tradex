import { apiFetch, apiJson, detailMessage } from './client';
import type { Playbook } from '../../types';

export type PlaybookRow = Playbook & { strategyTag?: string | null; source?: string };

export async function listPlaybooks(): Promise<PlaybookRow[]> {
  const { ok, data } = await apiFetch<{ playbooks?: PlaybookRow[] }>('/playbooks');
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data.playbooks) ? data.playbooks : [];
}

export async function createPlaybook(body: {
  name: string;
  type?: string;
  description?: string;
  rules?: string[];
  strategy_tag?: string | null;
  tags?: string[];
}): Promise<PlaybookRow> {
  return apiJson<PlaybookRow>('/playbooks', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updatePlaybook(
  id: string,
  body: Partial<{
    name: string;
    type: string;
    description: string;
    rules: string[];
    strategy_tag: string | null;
    tags: string[];
  }>
): Promise<PlaybookRow> {
  return apiJson<PlaybookRow>(`/playbooks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deletePlaybook(id: string): Promise<void> {
  await apiJson<void>(`/playbooks/${id}`, { method: 'DELETE' });
}
