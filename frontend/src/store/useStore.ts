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
import {
  createTradingAccount as createTradingAccountApi,
  listTradingAccounts,
  type TradingAccountRow,
} from '../lib/api/accounts';
import { createPlaybook as createPlaybookApi, listPlaybooks } from '../lib/api/playbooks';
import { mergePlaybooks } from '../lib/mergePlaybooks';
import { fetchNotebook } from '../lib/api/notebook';
import { fetchChallenges } from '../lib/api/challenges';
import { fetchAiInsights } from '../lib/api/ai';
import {
  createPaperAccount as createPaperAccountApi,
  fetchPaperAccounts,
} from '../lib/api/paperAccounts';
import { syncMt5Trades } from '../lib/api/sync';
import { derivePlaybooksFromTrades } from '../lib/derivePlaybooksFromTrades';

async function loadMergedPlaybooks(trades: Trade[]): Promise<Playbook[]> {
  const token = getToken();
  if (!token) return derivePlaybooksFromTrades(trades);
  try {
    const saved = await listPlaybooks();
    return mergePlaybooks(saved, trades);
  } catch {
    return derivePlaybooksFromTrades(trades);
  }
}

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
  lastMt5Sync: {
    import_kind?: string;
    demo_fallback_used?: boolean;
    connected?: boolean;
    at: string;
  } | null;

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
  refreshAiFromApi: () => Promise<AIInsight[]>;
  refreshPlaybooksFromApi: () => Promise<void>;
  createTradingAccount: (body: {
    name: string;
    broker?: string;
    account_type?: string;
    starting_balance?: number;
  }) => Promise<boolean>;
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
  lastMt5Sync: null,

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
        lastMt5Sync: null,
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
      const playbooks = await loadMergedPlaybooks(trades);
      set({ trades, playbooks });

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
    const list = await fetchPaperAccounts();
    set({
      paperAccounts: list,
      paperModeActive: list.some((a) => a.isActive),
    });
  },

  createPaperAccount: async (opts) => {
    const token = getToken();
    if (!token) return false;
    try {
      await createPaperAccountApi({
        name: opts?.name ?? 'Practice account',
      });
      await get().refreshPaperAccountsFromApi();
      return true;
    } catch {
      return false;
    }
  },

  refreshTradesFromApi: async () => {
    const token = getToken();
    if (!token) return;
    const aid = get().selectedTradingAccountId;
    const { trades } = await fetchTrades({ accountId: aid, limit: 500 });
    const playbooks = await loadMergedPlaybooks(trades);
    set({ trades, playbooks });
  },

  refreshPlaybooksFromApi: async () => {
    const token = getToken();
    if (!token) return;
    const playbooks = await loadMergedPlaybooks(get().trades);
    set({ playbooks });
  },

  createTradingAccount: async (body) => {
    const token = getToken();
    if (!token) return false;
    try {
      await createTradingAccountApi(body);
      const accounts = await listTradingAccounts();
      const firstId = accounts[accounts.length - 1]?.id ?? get().selectedTradingAccountId;
      set({
        tradingAccounts: accounts,
        selectedTradingAccountId: firstId,
        account: mapShellAccount(accounts.find((a) => a.id === firstId) ?? accounts[0]),
      });
      return true;
    } catch {
      return false;
    }
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
      equityCurve: bundle.equityCurve,
      dailyPnl: bundle.dailyPnl,
      calendarDays: calendar,
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
    if (!token) return get().aiInsights;
    const aid = get().selectedTradingAccountId;
    const insights = await fetchAiInsights(aid);
    set({ aiInsights: insights });
    return insights;
  },

  syncTrades: async (credentials) => {
    const token = getToken();
    if (!token) {
      return { ok: false, detail: 'Sign in to sync trades.' };
    }
    set({ isSyncing: true });
    try {
      const loginStr = credentials?.login?.trim();
      let login: number | undefined;
      if (loginStr) {
        const n = parseInt(loginStr, 10);
        if (!Number.isNaN(n)) login = n;
      }
      const data = await syncMt5Trades({
        days: credentials?.days ?? 90,
        server: credentials?.server?.trim() || undefined,
        login,
        password: credentials?.password,
        account_id: get().selectedTradingAccountId,
      });
      set({
        lastMt5Sync: {
          import_kind: data.import_kind,
          demo_fallback_used: data.demo_fallback_used,
          connected: data.connected,
          at: new Date().toISOString(),
        },
      });
      await get().refreshTradesFromApi();
      await get().refreshAnalyticsFromApi();
      return {
        ok: true,
        message: data.message ?? undefined,
        status: data.status,
        import_kind: data.import_kind,
        demo_fallback_used: data.demo_fallback_used,
        connected: data.connected,
      };
    } catch (e) {
      const detail = e instanceof Error ? e.message : 'Sync failed';
      return { ok: false, detail };
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

  addPlaybook: (pb) => {
    set((state) => ({ playbooks: [pb, ...state.playbooks] }));
    if (!getToken() || get().dataMode !== 'live') return;
    void (async () => {
      try {
        await createPlaybookApi({
          name: pb.name,
          type: pb.type,
          description: pb.description,
          rules: pb.rules,
          strategy_tag: pb.type === 'strategy' ? pb.name : null,
          tags: pb.tags,
        });
        await get().refreshPlaybooksFromApi();
      } catch {
        /* local card kept */
      }
    })();
  },
  updatePlaybook: (id, updates) =>
    set((state) => ({
      playbooks: state.playbooks.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deletePlaybook: (id) =>
    set((state) => ({ playbooks: state.playbooks.filter((p) => p.id !== id) })),
}));
