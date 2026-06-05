import { apiFetch, detailMessage } from './client';

export type ImportBatch = {
  id: string;
  source: string;
  source_account_id?: string | null;
  status: string;
  records_seen: number;
  records_inserted: number;
  records_updated: number;
  records_skipped_duplicate: number;
  records_failed: number;
  warnings: string[];
  summary: Record<string, unknown>;
  started_at?: string | null;
  completed_at?: string | null;
};

export async function fetchImportBatches(): Promise<ImportBatch[]> {
  const { ok, data } = await apiFetch<ImportBatch[]>('/imports/batches');
  if (!ok) throw new Error(detailMessage(data));
  return Array.isArray(data) ? data : [];
}

export async function fetchImportBatch(id: string): Promise<ImportBatch> {
  const { ok, data } = await apiFetch<ImportBatch>(`/imports/batches/${encodeURIComponent(id)}`);
  if (!ok) throw new Error(detailMessage(data));
  return data;
}
