import { create } from 'zustand';
import type { Trade, PerformanceMetrics, PropFirmChallenge, Playbook, NotebookEntry, AIInsight, Account } from '../types';
import { mockTrades, mockMetrics, mockPropChallenge, mockPlaybooks, mockNotebook, mockAIInsights, mockAccount } from '../data/mockData';

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
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setDateRange: (range: '7d' | '30d' | '90d' | 'all') => void;
  syncTrades: () => Promise<void>;
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

export const useStore = create<AppState>((set) => ({
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

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDateRange: (range) => set({ selectedDateRange: range }),

  syncTrades: async () => {
    set({ isSyncing: true });
    await new Promise(r => setTimeout(r, 2000));
    set({ isSyncing: false });
  },

  addTrade: (trade) => set(state => ({ trades: [trade, ...state.trades] })),
  updateTrade: (id, updates) => set(state => ({
    trades: state.trades.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteTrade: (id) => set(state => ({ trades: state.trades.filter(t => t.id !== id) })),

  addNotebookEntry: (entry) => set(state => ({ notebook: [entry, ...state.notebook] })),
  updateNotebookEntry: (id, updates) => set(state => ({
    notebook: state.notebook.map(n => n.id === id ? { ...n, ...updates } : n)
  })),
  deleteNotebookEntry: (id) => set(state => ({ notebook: state.notebook.filter(n => n.id !== id) })),
  dismissInsight: (id) => set(state => ({ aiInsights: state.aiInsights.filter(i => i.id !== id) })),

  addPlaybook: (pb) => set(state => ({ playbooks: [pb, ...state.playbooks] })),
  updatePlaybook: (id, updates) => set(state => ({
    playbooks: state.playbooks.map(p => (p.id === id ? { ...p, ...updates } : p)),
  })),
  deletePlaybook: (id) => set(state => ({ playbooks: state.playbooks.filter(p => p.id !== id) })),
}));
