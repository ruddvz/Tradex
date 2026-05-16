import type { PaperAccount } from '../types';

export function mapPaperAccountRow(row: Record<string, unknown>): PaperAccount {
  return {
    id: String(row.id ?? ''),
    userId: String(row.user_id ?? ''),
    name: String(row.name ?? ''),
    currency: String(row.currency ?? 'USD'),
    startingBalance: Number(row.starting_balance ?? 0),
    isActive: Boolean(row.is_active ?? true),
    createdAt: String(row.created_at ?? '').slice(0, 19).replace(' ', 'T'),
  };
}

export async function fetchPaperAccounts(token: string): Promise<PaperAccount[]> {
  const res = await fetch('/api/v1/paper-accounts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => null)) as unknown;
  if (!res.ok || !Array.isArray(data)) return [];
  return data.map((r) => mapPaperAccountRow(r as Record<string, unknown>));
}

export async function createPaperAccountApi(
  token: string,
  body: { name?: string; currency?: string; starting_balance?: number; is_active?: boolean }
): Promise<PaperAccount | null> {
  const res = await fetch('/api/v1/paper-accounts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const row = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) return null;
  return mapPaperAccountRow(row);
}
