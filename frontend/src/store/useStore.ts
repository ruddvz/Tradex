import { create } from 'zustand';
import type { Trade, PerformanceMetrics, PropFirmChallenge, Playbook, NotebookEntry, AIInsight, Account } from '../types';
import { mockTrades, mockMetrics, mockPropChallenge, mockPlaybooks, mockNotebook, mockAIInsights, mockAccount } from '../data/mockData';
import { getToken } from '../lib/auth';
import {
  EMPTY_PROP_CHALLENGE,
  fetchAiInsights,
  fetchAuthMe,
  fetchChallenges,
  fetchMetrics,
  fetchNotebook,
  fetchTradesList,
  mapApiNotebookEntry,
  type DataSource,
} from '../lib/liveApi';

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
  dataSource: DataSource;
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

  setSidebarOpen: (open: boolean) => void;
  setDateRange: (range: '7d' | '30d' | '90d' | 'all') => void;
  openMt5SyncModal: () => void;
  closeMt5SyncModal: () => void;
  hydrateFromApi: () => Promise<void>;
  resetToDemo: () => void;
  refreshTradesFromApi: () => Promise<void>;
  syncTrades: (credentials?: Mt5CredentialsInput) => Promise<SyncTradesResult>;
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  addNotebookEntry: (entry: NotebookEntry) => Promise<void>;
  updateNotebookEntry: (id: string, updates: Partial<NotebookEntry>) => Promise<void>;
  deleteNotebookEntry: (id: string) => Promise<void>;
  dismissInsight: (id: string) => void;
  addPlaybook: (pb: Playbook) => void;
  updatePlaybook: (id: string, updates: Partial<Playbook>) => void;
  deletePlaybook: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  dataSource: 'demo',
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

  setDateRange: (range) => {
    set({ selectedDateRange: range });
    const token = getToken();
    if (!token || get().dataSource !== 'live') return;
    void (async () => {
      const m = await fetchMetrics(token, range);
      const ai = await fetchAiInsights(token);
      set({ metrics: m, aiInsights: ai });
    })();
  },

  openMt5SyncModal: () => set({ mt5SyncModalOpen: true }),
  closeMt5SyncModal: () => set({ mt5SyncModalOpen: false }),

  resetToDemo: () =>
    set({
      dataSource: 'demo',
      trades: mockTrades,
      metrics: mockMetrics,
      propChallenge: mockPropChallenge,
      playbooks: mockPlaybooks,
      notebook: mockNotebook,
      aiInsights: mockAIInsights,
      account: mockAccount,
    }),

  hydrateFromApi: async () => {
    const token = getToken();
    if (!token) {
      get().resetToDemo();
      return;
    }
    try {
      const range = get().selectedDateRange;
      const [trades, metrics, challenges, entries, aiList, acct] = await Promise.all([
        fetchTradesList(token),
        fetchMetrics(token, range),
        fetchChallenges(token),
        fetchNotebook(token),
        fetchAiInsights(token),
        fetchAuthMe(token),
      ]);
      const challenge = challenges.length > 0 ? challenges[0]! : EMPTY_PROP_CHALLENGE;
      set({
        dataSource: 'live',
        trades,
        metrics,
        propChallenge: challenge,
        notebook: entries,
        aiInsights: aiList,
        account: acct ?? get().account,
      });
    } catch {
      get().resetToDemo();
    }
  },

  refreshTradesFromApi: async () => {
    await get().hydrateFromApi();
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
      await get().hydrateFromApi();
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

  addNotebookEntry: async (entry) => {
    const token = getToken();
    if (!token) {
      set((state) => ({ notebook: [entry, ...state.notebook] }));
      return;
    }
    const res = await fetch('/api/v1/notebook', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: entry.title,
        content: entry.content,
        type: entry.type,
        tags: entry.tags,
        pinned: entry.pinned,
      }),
    });
    const row = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) return;
    const mapped = mapApiNotebookEntry(row);
    set((state) => ({ notebook: [mapped, ...state.notebook] }));
  },

  updateNotebookEntry: async (id, updates) => {
    const token = getToken();
    if (!token) {
      set((state) => ({
        notebook: state.notebook.map((n) => (n.id === id ? { ...n, ...updates } : n)),
      }));
      return;
    }
    const body: Record<string, unknown> = {};
    if (updates.title != null) body.title = updates.title;
    if (updates.content != null) body.content = updates.content;
    if (updates.tags != null) body.tags = updates.tags;
    if (updates.pinned != null) body.pinned = updates.pinned;
    if (updates.type != null) body.type = updates.type;
    const res = await fetch(`/api/v1/notebook/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const row = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) return;
    const mapped = mapApiNotebookEntry(row);
    set((state) => ({
      notebook: state.notebook.map((n) => (n.id === id ? mapped : n)),
    }));
  },

  deleteNotebookEntry: async (id) => {
    const token = getToken();
    if (!token) {
      set((state) => ({ notebook: state.notebook.filter((n) => n.id !== id) }));
      return;
    }
    const res = await fetch(`/api/v1/notebook/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 204 || res.ok) {
      set((state) => ({ notebook: state.notebook.filter((n) => n.id !== id) }));
    }
  },

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
