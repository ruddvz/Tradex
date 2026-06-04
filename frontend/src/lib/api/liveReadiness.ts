import { apiFetch, detailMessage } from './client';

export type ReadinessItem = {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
  detail: string;
};

export type LiveReadinessReport = {
  live_execution_enabled: boolean;
  ready_for_review: boolean;
  passed_required: number;
  total_required: number;
  items: ReadinessItem[];
  disclaimer: string;
  paper_vs_backtest_hint: string;
};

export async function fetchLiveReadiness(): Promise<LiveReadinessReport> {
  const { ok, data } = await apiFetch<LiveReadinessReport>('/live-readiness');
  if (!ok) throw new Error(detailMessage(data));
  return data;
}
