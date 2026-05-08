import { create } from 'zustand';
import type { Trade, PerformanceMetrics, PropFirmChallenge, Playbook, NotebookEntry, AIInsight, Account } from '../types';
import { mockTrades, mockMetrics, mockPropChallenge, mockPlaybooks, mockNotebook, mockAIInsights, mockAccount } from '../data/mockData';
import { getToken } from '../lib/auth';
import { mapApiTradeRow } from '../lib/mapApiTrade';

export type Mt5CredentialsInput = {
  server?: string;
  login?: string;
  password?: string;
  days?: number;
};

export type SyncTradesResult = {
  ok: boolean;
  detail?: string;
  message?: string;
  status?: string;
};

interface AppState {
  trades: Trade[];
  metrics: PerformanceMetrics;
  propChallenge: PropFirmChallenge;
  playbooks: Playbook[];
  notebook: NotebookEntry[];
  aiInsights: AIInsight[];
  account: Account;
  sidebarOpen: boolean;
  selectedDateRange: '7d' | '30d' | '90d' | 'all';
  isSyncing: boolean;
  mt5SyncModalOpen: boolean;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setDateRange: (range: '7d' | '30d' | '90d' | 'all') => void;
  openMt5SyncModal: () => void;
  closeMt5SyncModal: () => void;
  refreshTradesFromApi: () => Promise<void>;
  syncTrades: (credentials?: Mt5CredentialsInput) => Promise<SyncTradesResult>;
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  addNotebookEntry: (entry: NotebookEntry) => void;
  updateNotebookEntry: (id: string, updates: Partial<NotebookEntry>) => void;
  deleteNotebookEntry: (id: string) => void;
  dismissInsight: (id: string) => void;
  addPlaybook: (pb: Playbook) => void;
  updatePlaybook: (id: string, updates: Partial<Playbook>) => void;
  deletePlaybook: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  trades: mockTrades,
  metrics: mockMetrics,
  propChallenge: mockPropChallenge,
  playbooks: mockPlaybooks,
  notebook: mockNotebook,
  aiInsights: mockAIInsights,
  account: mockAccount,
  sidebarOpen: true,
  selectedDateRange: '90d',
  isSyncing: false,
  mt5SyncModalOpen: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDateRange: (range) => set({ selectedDateRange: range }),

  openMt5SyncModal: () => set({ mt5SyncModalOpen: true }),
  closeMt5SyncModal: () => set({ mt5SyncModalOpen: false }),

  refreshTradesFromApi: async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch('/api/v1/trades', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json().catch(() => ({}))) as {
      trades?: Record<string, unknown>[];
    };
    if (!res.ok || !Array.isArray(data.trades)) return;
    set({
      trades: data.trades.map((row) => mapApiTradeRow(row)),
    });
  },

  syncTrades: async (credentials) => {
    const token = getToken();
    if (!token) {
      return { ok: false, detail: 'Sign in to sync trades.' };
    }
    set({ isSyncing: true });
    try {
      const body: Record<string, unknown> = { days: credentials?.days ?? 90 };
      const server = credentials?.server?.trim();
      const loginStr = credentials?.login?.trim();
      if (server) body.server = server;
      if (loginStr) {
        const n = parseInt(loginStr, 10);
        if (!Number.isNaN(n)) body.login = n;
      }
      if (credentials?.password) body.password = credentials.password;

      const res = await fetch('/api/v1/sync/mt5', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as {
        detail?: string | { msg: string }[];
        message?: string;
        status?: string;
      };
      if (!res.ok) {
        let detail = 'Sync failed';
        if (typeof data.detail === 'string') detail = data.detail;
        else if (Array.isArray(data.detail) && data.detail[0]?.msg)
          detail = data.detail[0].msg;
        return { ok: false, detail };
      }
      await get().refreshTradesFromApi();
      return {
        ok: true,
        message: typeof data.message === 'string' ? data.message : undefined,
        status: typeof data.status === 'string' ? data.status : undefined,
      };
    } finally {
      set({ isSyncing: false });
    }
  },

  addTrade: (trade) => set((state) => ({ trades: [trade, ...state.trades] })),
  updateTrade: (id, updates) =>
    set((state) => ({
      trades: state.trades.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTrade: (id) =>
    set((state) => ({ trades: state.trades.filter((t) => t.id !== id) })),

  addNotebookEntry: (entry) =>
    set((state) => ({ notebook: [entry, ...state.notebook] })),
  updateNotebookEntry: (id, updates) =>
    set((state) => ({
      notebook: state.notebook.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  deleteNotebookEntry: (id) =>
    set((state) => ({ notebook: state.notebook.filter((n) => n.id !== id) })),
  dismissInsight: (id) =>
    set((state) => ({ aiInsights: state.aiInsights.filter((i) => i.id !== id) })),

  addPlaybook: (pb) => set((state) => ({ playbooks: [pb, ...state.playbooks] })),
  updatePlaybook: (id, updates) =>
    set((state) => ({
      playbooks: state.playbooks.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deletePlaybook: (id) =>
    set((state) => ({ playbooks: state.playbooks.filter((p) => p.id !== id) })),
}));
