import { apiFetch, apiJson, detailMessage } from './client';

export type Mt5Settings = {
  server: string | null;
  login: string | null;
  has_password: boolean;
};

export type NotificationPrefs = {
  email: boolean;
  push: boolean;
  drawdownAlerts: boolean;
  dailyReport: boolean;
};

export async function fetchMt5Settings(): Promise<Mt5Settings> {
  return apiJson<Mt5Settings>('/settings/mt5');
}

export async function updateMt5Settings(body: {
  server?: string | null;
  login?: string | null;
  password?: string | null;
}): Promise<Mt5Settings> {
  return apiJson<Mt5Settings>('/settings/mt5', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function fetchNotificationSettings(): Promise<NotificationPrefs> {
  return apiJson<NotificationPrefs>('/settings/notifications');
}

export async function updateNotificationSettings(
  patch: Partial<NotificationPrefs>
): Promise<NotificationPrefs> {
  return apiJson<NotificationPrefs>('/settings/notifications', {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
}

export async function triggerDailyReports(cronSecret?: string): Promise<unknown> {
  const headers: HeadersInit = {};
  if (cronSecret) headers['X-Cron-Secret'] = cronSecret;
  const { ok, data } = await apiFetch('/notifications/send-daily', {
    method: 'POST',
    headers,
  });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}
