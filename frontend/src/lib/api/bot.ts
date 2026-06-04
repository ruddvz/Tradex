import { apiFetch, detailMessage } from './client';

export type BotStatus = {
  kill_switch_active: boolean;
  paper_orders_paused: boolean;
  live_execution_enabled: boolean;
};

export async function fetchBotStatus(): Promise<BotStatus> {
  const { ok, data } = await apiFetch<BotStatus>('/bot/status');
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function activateKillSwitch(): Promise<BotStatus> {
  const { ok, data } = await apiFetch<BotStatus>('/bot/kill-switch', { method: 'POST' });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}

export async function resumePaperOnly(): Promise<BotStatus> {
  const { ok, data } = await apiFetch<BotStatus>('/bot/resume-paper-only', { method: 'POST' });
  if (!ok) throw new Error(detailMessage(data));
  return data;
}
