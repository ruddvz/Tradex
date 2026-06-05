/** Session auth — httpOnly cookies + in-memory access token (Bearer fallback). */

export const AUTH_TOKEN_KEY = 'tradex_access_token';

let accessToken: string | null = null;
let legacyMigrated = false;

export function getToken(): string | null {
  return accessToken;
}

export function setToken(token: string): void {
  accessToken = token;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearToken(): void {
  accessToken = null;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function isAuthenticated(): boolean {
  return Boolean(accessToken);
}

/** One-time migration from pre-cookie localStorage JWT storage. */
export function migrateLegacyToken(): void {
  if (legacyMigrated || typeof window === 'undefined') return;
  legacyMigrated = true;
  if (accessToken) return;
  try {
    const legacy = localStorage.getItem(AUTH_TOKEN_KEY);
    if (legacy) {
      accessToken = legacy;
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Rotate access token using httpOnly refresh cookie. */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      clearToken();
      return false;
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) {
      clearToken();
      return false;
    }
    setToken(data.access_token);
    return true;
  } catch {
    clearToken();
    return false;
  }
}

/** Clear httpOnly cookies server-side and wipe in-memory token. */
export async function logoutSession(): Promise<void> {
  try {
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    /* still clear local session */
  } finally {
    clearToken();
  }
}
