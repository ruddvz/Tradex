import { getToken } from '../auth';

const API_PREFIX = '/api/v1';

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T;
};

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_PREFIX}${p}`;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (
    init.body !== undefined &&
    typeof init.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(apiUrl(path), { ...init, headers });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

export function detailMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Request failed';
  const d = data as { detail?: unknown };
  const det = d.detail;
  if (typeof det === 'string') return det;
  if (Array.isArray(det) && det[0] && typeof det[0] === 'object' && 'msg' in det[0]) {
    return String((det[0] as { msg: string }).msg);
  }
  return 'Request failed';
}
