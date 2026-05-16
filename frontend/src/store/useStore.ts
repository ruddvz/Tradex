import { create } from 'zustand';
import type {
  Trade,
  PerformanceMetrics,
  PropFirmChallenge,
  Playbook,
  NotebookEntry,
  AIInsight,
  Account,
} from '../types';
import {
  mockTrades,
  mockMetrics,
  mockPropChallenge,
  mockPlaybooks,
  mockNotebook,
  mockAIInsights,
  mockAccount,
} from '../data/mockData';
import { getToken } from '../lib/auth';
import { fetchTrades, deleteTradeApi } from '../lib/api/trades';
import { fetchMetrics } from '../lib/api/analytics';
import { listTradingAccounts, type TradingAccountRow } from '../lib/api/accounts';
import { fetchNotebook } from '../lib/api/notebook';
import { fetchChallenges } from '../lib/api/challenges';
import { fetchAiInsights } from '../lib/api/ai';

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
  import_kind?: string;
  demo_fallback_used?: boolean;
  connected?: boolean;
};

export type DataMode = 'demo' | 'live';

interface AppState {
  dataMode: DataMode;
  bootstrapError: string | null;
  tradingAccounts: TradingAccountRow[];
  selectedTradingAccountId: string | null;

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
  setSelectedTradingAccountId: (id: string | null) => void;
  openMt5SyncModal: () => void;
  closeMt5SyncModal: () => void;
  hydrateLiveSession: () => Promise<void>;
  refreshTradesFromApi: () => Promise<void>;
  refreshMetricsFromApi: () => Promise<void>;
  refreshNotebookFromApi: () => Promise<void>;
  refreshChallengesFromApi: () => Promise<void>;
  refreshAiFromApi: () => Promise<void>;
  syncTrades: (credentials?: Mt5CredentialsInput) => Promise<SyncTradesResult>;
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => Promise<void>;
  addNotebookEntry: (entry: NotebookEntry) => void;
  updateNotebookEntry: (id: string, updates: Partial<NotebookEntry>) => void;
  deleteNotebookEntry: (id: string) => void;
  dismissInsight: (id: string) => void;
  addPlaybook: (pb: Playbook) => void;
  updatePlaybook: (id: string, updates: Partial<Playbook>) => void;
  deletePlaybook: (id: string) => void;
}

function mapShellAccount(primary: TradingAccountRow | undefined): Account {
  if (!primary) return mockAccount;
  return {
    id: primary.id,
    name: primary.name,
    broker: primary.broker ?? '',
    balance: primary.current_balance,
    equity: primary.current_equity,
    currency: primary.base_currency,
    type: primary.account_type === 'live' ? 'live' : primary.account_type === 'prop' ? 'prop' : 'demo',
    connected: true,
    lastSync: undefined,
  };
}

export const useStore = create<AppState>((set, get) => ({
  dataMode: 'demo',
  bootstrapError: null,
  tradingAccounts: [],
  selectedTradingAccountId: null,

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
  setSelectedTradingAccountId: (id) => {
    set({ selectedTradingAccountId: id });
    const ac = get().tradingAccounts.find((a) => a.id === id);
    set({ account: mapShellAccount(ac ?? get().tradingAccounts[0]) });
    void get().refreshTradesFromApi();
    void get().refreshMetricsFromApi();
    void get().refreshAiFromApi();
  },

  openMt5SyncModal: () => set({ mt5SyncModalOpen: true }),
  closeMt5SyncModal: () => set({ mt5SyncModalOpen: false }),

  hydrateLiveSession: async () => {
    const token = getToken();
    if (!token) {
      set({
        dataMode: 'demo',
        bootstrapError: null,
        tradingAccounts: [],
        selectedTradingAccountId: null,
        trades: mockTrades,
        metrics: mockMetrics,
        propChallenge: mockPropChallenge,
        notebook: mockNotebook,
        aiInsights: mockAIInsights,
        account: mockAccount,
      });
      return;
    }
    set({ dataMode: 'live', bootstrapError: null });
    try {
      const accounts = await listTradingAccounts();
      const firstId = accounts[0]?.id ?? null;
      set({
        tradingAccounts: accounts,
        selectedTradingAccountId: firstId,
        account: mapShellAccount(accounts[0]),
      });

      const { trades } = await fetchTrades({ accountId: firstId, limit: 500 });
      set({ trades });

      const metrics = await fetchMetrics(firstId);
      set({ metrics });

      const notebook = await fetchNotebook();
      set({ notebook });

      const challenges = await fetchChallenges();
      if (challenges.length > 0) {
        set({ propChallenge: challenges[0] });
      }

      const insights = await fetchAiInsights(firstId);
      set({ aiInsights: insights });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load live data';
      set({ bootstrapError: msg, dataMode: 'demo' });
    }
  },

  refreshTradesFromApi: async () => {
    const token = getToken();
    if (!token) return;
    const aid = get().selectedTradingAccountId;
    const { trades } = await fetchTrades({ accountId: aid, limit: 500 });
    set({ trades });
  },

  refreshMetricsFromApi: async () => {
    const token = getToken();
    if (!token) return;
    const aid = get().selectedTradingAccountId;
    const metrics = await fetchMetrics(aid);
    set({ metrics });
  },

  refreshNotebookFromApi: async () => {
    const token = getToken();
    if (!token) return;
    const notebook = await fetchNotebook();
    set({ notebook });
  },

  refreshChallengesFromApi: async () => {
    const token = getToken();
    if (!token) return;
    const challenges = await fetchChallenges();
    if (challenges.length > 0) set({ propChallenge: challenges[0] });
  },

  refreshAiFromApi: async () => {
    const token = getToken();
    if (!token) return;
    const aid = get().selectedTradingAccountId;
    const insights = await fetchAiInsights(aid);
    set({ aiInsights: insights });
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
      const aid = get().selectedTradingAccountId;
      if (aid) body.account_id = aid;

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
        import_kind?: string;
        demo_fallback_used?: boolean;
        connected?: boolean;
      };
      if (!res.ok) {
        let detail = 'Sync failed';
        if (typeof data.detail === 'string') detail = data.detail;
        else if (Array.isArray(data.detail) && data.detail[0]?.msg)
          detail = data.detail[0].msg;
        return { ok: false, detail };
      }
      await get().refreshTradesFromApi();
      await get().refreshMetricsFromApi();
      return {
        ok: true,
        message: typeof data.message === 'string' ? data.message : undefined,
        status: typeof data.status === 'string' ? data.status : undefined,
        import_kind: typeof data.import_kind === 'string' ? data.import_kind : undefined,
        demo_fallback_used: Boolean(data.demo_fallback_used),
        connected: typeof data.connected === 'boolean' ? data.connected : undefined,
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
  deleteTrade: async (id) => {
    if (getToken() && get().dataMode === 'live') {
      await deleteTradeApi(id);
      await get().refreshTradesFromApi();
      await get().refreshMetricsFromApi();
      return;
    }
    set((state) => ({ trades: state.trades.filter((t) => t.id !== id) }));
  },

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
