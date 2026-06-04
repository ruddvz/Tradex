import { create } from 'zustand';
import type {
  Trade,
  PerformanceMetrics,
  PropFirmChallenge,
  Playbook,
  NotebookEntry,
  AIInsight,
  Account,
  PaperAccount,
  CalendarDay,
} from '../types';
import {
  mockTrades,
  mockMetrics,
  mockPropChallenge,
  mockPlaybooks,
  mockNotebook,
  mockAIInsights,
  mockAccount,
  mockEquityCurve,
  mockCalendar,
  mockDailyStats,
} from '../data/mockData';
import { getToken } from '../lib/auth';
import { fetchTrades, deleteTradeApi, updateTradeApi, type UpdateTradePayload } from '../lib/api/trades';
import { fetchAnalyticsBundle, fetchCalendar } from '../lib/api/analytics';
import { fetchBotStatus, activateKillSwitch, resumePaperOnly, type BotStatus } from '../lib/api/bot';
import type { EquityPoint, DailyPnlPoint } from '../lib/mapAnalytics';
import { listTradingAccounts, type TradingAccountRow } from '../lib/api/accounts';
import { fetchNotebook } from '../lib/api/notebook';
import { fetchChallenges } from '../lib/api/challenges';
import { fetchAiInsights } from '../lib/api/ai';
import { createPaperAccountApi, fetchPaperAccounts } from '../lib/paperAccountsApi';
import { derivePlaybooksFromTrades } from '../lib/derivePlaybooksFromTrades';

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
  equityCurve: EquityPoint[];
  dailyPnl: DailyPnlPoint[];
  calendarDays: CalendarDay[];
  propChallenge: PropFirmChallenge;
  playbooks: Playbook[];
  notebook: NotebookEntry[];
  aiInsights: AIInsight[];
  account: Account;
  paperAccounts: PaperAccount[];
  paperModeActive: boolean;
  botStatus: BotStatus | null;
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
  refreshAnalyticsFromApi: () => Promise<void>;
  refreshMetricsFromApi: () => Promise<void>;
  refreshBotStatusFromApi: () => Promise<void>;
  triggerKillSwitch: () => Promise<void>;
  resumePaperTrading: () => Promise<void>;
  refreshNotebookFromApi: () => Promise<void>;
  refreshChallengesFromApi: () => Promise<void>;
  refreshAiFromApi: () => Promise<void>;
  refreshPaperAccountsFromApi: () => Promise<void>;
  clearPaperState: () => void;
  createPaperAccount: (opts?: { name?: string }) => Promise<boolean>;
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

const demoDailyPnl = mockDailyStats.map((d) => ({ date: d.date, pnl: d.pnl, trades: d.trades }));

export const useStore = create<AppState>((set, get) => ({
  dataMode: 'demo',
  bootstrapError: null,
  tradingAccounts: [],
  selectedTradingAccountId: null,

  trades: mockTrades,
  metrics: mockMetrics,
  equityCurve: mockEquityCurve,
  dailyPnl: demoDailyPnl,
  calendarDays: mockCalendar,
  propChallenge: mockPropChallenge,
  playbooks: mockPlaybooks,
  notebook: mockNotebook,
  aiInsights: mockAIInsights,
  account: mockAccount,
  paperAccounts: [],
  paperModeActive: false,
  botStatus: null,
  sidebarOpen: true,
  selectedDateRange: '90d',
  isSyncing: false,
  mt5SyncModalOpen: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDateRange: (range) => {
    set({ selectedDateRange: range });
    if (get().dataMode === 'live') void get().refreshAnalyticsFromApi();
  },
  setSelectedTradingAccountId: (id) => {
    set({ selectedTradingAccountId: id });
    const ac = get().tradingAccounts.find((a) => a.id === id);
    set({ account: mapShellAccount(ac ?? get().tradingAccounts[0]) });
    void get().refreshTradesFromApi();
    void get().refreshAnalyticsFromApi();
    void get().refreshAiFromApi();
    void get().refreshChallengesFromApi();
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
        equityCurve: mockEquityCurve,
        dailyPnl: demoDailyPnl,
        calendarDays: mockCalendar,
        propChallenge: mockPropChallenge,
        notebook: mockNotebook,
        aiInsights: mockAIInsights,
        account: mockAccount,
        paperAccounts: [],
        paperModeActive: false,
        botStatus: null,
        playbooks: mockPlaybooks,
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
      set({ trades, playbooks: derivePlaybooksFromTrades(trades) });

      await get().refreshAnalyticsFromApi();

      const notebook = await fetchNotebook();
      set({ notebook });

      const challenges = await fetchChallenges();
      if (challenges.length > 0) {
        set({ propChallenge: challenges[0] });
      }

      const insights = await fetchAiInsights(firstId);
      set({ aiInsights: insights });
      await get().refreshPaperAccountsFromApi();
      await get().refreshBotStatusFromApi();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load live data';
      set({
        bootstrapError: msg,
        dataMode: 'demo',
        paperAccounts: [],
        paperModeActive: false,
      });
    }
  },

  clearPaperState: () => set({ paperAccounts: [], paperModeActive: false }),

  refreshPaperAccountsFromApi: async () => {
    const token = getToken();
    if (!token) {
      set({ paperAccounts: [], paperModeActive: false });
      return;
    }
    const list = await fetchPaperAccounts(token);
    set({
      paperAccounts: list,
      paperModeActive: list.some((a) => a.isActive),
    });
  },

  createPaperAccount: async (opts) => {
    const token = getToken();
    if (!token) return false;
    const created = await createPaperAccountApi(token, {
      name: opts?.name ?? 'Practice account',
    });
    if (!created) return false;
    await get().refreshPaperAccountsFromApi();
    return true;
  },

  refreshTradesFromApi: async () => {
    const token = getToken();
    if (!token) return;
    const aid = get().selectedTradingAccountId;
    const { trades } = await fetchTrades({ accountId: aid, limit: 500 });
    set({ trades, playbooks: derivePlaybooksFromTrades(trades) });
  },

  refreshAnalyticsFromApi: async () => {
    const token = getToken();
    if (!token) return;
    const aid = get().selectedTradingAccountId;
    const range = get().selectedDateRange;
    const bundle = await fetchAnalyticsBundle(range, aid);
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const calendar = await fetchCalendar(days, aid, range);
    set({
      metrics: bundle.metrics,
      equityCurve: bundle.equityCurve.length ? bundle.equityCurve : mockEquityCurve,
      dailyPnl: bundle.dailyPnl.length ? bundle.dailyPnl : demoDailyPnl,
      calendarDays: calendar.length ? calendar : mockCalendar,
    });
  },

  refreshMetricsFromApi: async () => {
    await get().refreshAnalyticsFromApi();
  },

  refreshBotStatusFromApi: async () => {
    const token = getToken();
    if (!token) return;
    try {
      set({ botStatus: await fetchBotStatus() });
    } catch {
      set({ botStatus: null });
    }
  },

  triggerKillSwitch: async () => {
    const token = getToken();
    if (!token) return;
    set({ botStatus: await activateKillSwitch() });
  },

  resumePaperTrading: async () => {
    const token = getToken();
    if (!token) return;
    set({ botStatus: await resumePaperOnly() });
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
      await get().refreshAnalyticsFromApi();
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
  updateTrade: (id, updates) => {
    set((state) => ({
      trades: state.trades.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    if (!getToken() || get().dataMode !== 'live') return;
    const patch: UpdateTradePayload = {};
    if (updates.strategy !== undefined) patch.strategy = updates.strategy;
    if (updates.session !== undefined) patch.session = updates.session;
    if (updates.emotion !== undefined) patch.emotion = updates.emotion;
    if (updates.emotionScore !== undefined) patch.emotion_score = updates.emotionScore;
    if (updates.notes !== undefined) patch.notes = updates.notes;
    if (updates.tags !== undefined) patch.tags = updates.tags;
    if (updates.grade !== undefined) patch.grade = updates.grade;
    if (Object.keys(patch).length === 0) return;
    void (async () => {
      try {
        const row = await updateTradeApi(id, patch);
        set((state) => ({
          trades: state.trades.map((t) => (t.id === id ? row : t)),
        }));
        await get().refreshAnalyticsFromApi();
      } catch {
        /* optimistic UI kept; user can retry save */
      }
    })();
  },
  deleteTrade: async (id) => {
    if (getToken() && get().dataMode === 'live') {
      await deleteTradeApi(id);
      await get().refreshTradesFromApi();
      await get().refreshAnalyticsFromApi();
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
