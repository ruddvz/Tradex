import { apiFetch, detailMessage } from './client';
import type { NotebookEntry } from '../../types';

function mapEntry(row: Record<string, unknown>): NotebookEntry {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    content: String(row.content ?? ''),
    type: (String(row.type ?? 'note') as NotebookEntry['type']) || 'note',
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
    pinned: Boolean(row.pinned),
  };
}

export async function fetchNotebook(): Promise<NotebookEntry[]> {
  const { ok, data } = await apiFetch<{ entries?: Record<string, unknown>[] }>('/notebook');
  if (!ok) throw new Error(detailMessage(data));
  const rows = data.entries ?? [];
  return rows.map((r) => mapEntry(r));
}
