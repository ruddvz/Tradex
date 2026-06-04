import { apiJson } from './client';

export type Mt5SyncResult = {
  status: string;
  import_kind: string;
  connected: boolean;
  demo_fallback_used: boolean;
  synced: number;
  new: number;
  message?: string | null;
};

export async function syncMt5Trades(body: {
  server?: string;
  login?: number;
  password?: string;
  days?: number;
  account_id?: string | null;
}): Promise<Mt5SyncResult> {
  return apiJson<Mt5SyncResult>('/sync/mt5', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
