# Tradex — Pixel-Perfect UI/UX Perfection Prompt
## Comprehensive Agent Instruction File

> **Repo:** `github.com/Ruddvz/tradex`
> **Stack:** React 19 + TypeScript + Vite + TailwindCSS 3 + Recharts + Zustand + React Router DOM v7 + Vite PWA
> **Deployment:** GitHub Pages at `/Tradex/` (production base path)
> **App type:** AI-powered trading journal — dark SaaS dashboard, PWA-first

---

## Context for Agent

You are working on the **Tradex** frontend (`/frontend/src/`). This is a fully working React SPA with 8 pages, a collapsible sidebar, fixed header, and Recharts-powered analytics. All data is currently mock/in-memory via `src/data/mockData.ts` and `src/store/useStore.ts`. The design system lives in `src/index.css` (Tailwind `@layer` utilities) and `tailwind.config.js` (custom color tokens, shadows, animations). PWA is configured in `vite.config.ts` via `vite-plugin-pwa`.

Your job is to **make every screen pixel-perfect, every interaction real and working, and the PWA flawless on both mobile and desktop.** Do not touch any mock data or backend logic. Do not add new pages or features beyond the existing 8 routes.

---

## 0. Pre-Flight Audit (Run First)

Before touching any code, run these checks and document every issue found:

```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:5173/
# Resize window from 320px to 1920px — document every layout break
# Open DevTools → Application → Manifest → verify PWA fields
# Open DevTools → Lighthouse → run PWA + Performance audit
# Open DevTools → Console → zero errors target
```

Record all issues in a table before starting:

| # | Page | Issue Type | Description | Priority |
|---|------|------------|-------------|----------|
| … | … | Layout / UX / Visual / PWA / Perf | … | P1/P2/P3 |

---

## 1. PWA — Make It Production-Grade

### 1.1 `index.html` — Full PWA Meta Tags

Replace the existing `<head>` with this complete set. Every tag is required for correct install behavior on iOS Safari, Android Chrome, and desktop Chrome/Edge:

```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

    <!-- PWA Core -->
    <meta name="theme-color" content="#0b0f16" media="(prefers-color-scheme: dark)" />
    <meta name="theme-color" content="#0b0f16" />
    <meta name="background-color" content="#020617" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Tradex" />

    <!-- SEO + Share -->
    <meta name="description" content="Tradex — AI-Powered Trading Journal for Forex, Gold, Indices & Stock Traders." />
    <meta name="application-name" content="Tradex" />
    <meta property="og:title" content="Tradex | Trader's Performance Lab" />
    <meta property="og:description" content="Journal, analyze, and improve your trading edge with AI-powered insights." />
    <meta property="og:type" content="website" />

    <!-- Icons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/pwa-192.png" />
    <link rel="manifest" href="/manifest.webmanifest" />

    <!-- Fonts — preconnect first, then preload critical weight -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" />

    <title>Tradex | Trader's Performance Lab</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 1.2 `vite.config.ts` — Enhanced PWA Manifest

Update the `VitePWA` manifest block to include all required fields for standalone PWA on iOS and Android:

```ts
manifest: {
  name: 'Tradex — Trader\'s Performance Lab',
  short_name: 'Tradex',
  description: 'AI-Powered Trading Journal for Forex, Gold, Indices & Stock Traders.',
  theme_color: '#0b0f16',
  background_color: '#020617',
  display: 'standalone',
  display_override: ['standalone', 'minimal-ui'],
  orientation: 'any',
  scope: base,
  start_url: base,
  categories: ['finance', 'productivity'],
  lang: 'en',
  dir: 'ltr',
  prefer_related_applications: false,
  screenshots: [],
  shortcuts: [
    {
      name: 'Dashboard',
      url: base,
      description: 'Open trading dashboard',
    },
    {
      name: 'Trade Journal',
      url: `${base}journal`,
      description: 'View your trade journal',
    },
  ],
  icons: [
    { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
},
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gstatic-fonts-cache',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
  ],
},
```

### 1.3 Safe Area Insets (iOS Notch / Dynamic Island)

Add to `src/index.css` inside `@layer base`:

```css
/* iOS safe area insets for PWA standalone mode */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Sidebar must not overlap iOS home indicator */
.sidebar-safe {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

/* Header must clear status bar in standalone mode */
.header-safe {
  padding-top: env(safe-area-inset-top);
  height: calc(4rem + env(safe-area-inset-top));
}
```

Apply `.header-safe` to the `<header>` in `Header.tsx` and `.sidebar-safe` to the bottom div in `Sidebar.tsx`.

---

## 2. Layout — Mobile-First Complete Fix

### 2.1 `Layout.tsx` — Mobile Bottom Nav + Responsive Shell

The current layout uses a fixed sidebar that collapses to `w-16`. **On mobile (< 768px) the sidebar must hide entirely and a bottom navigation bar must appear.** This is the standard mobile PWA pattern.

Full replacement for `src/components/layout/Layout.tsx`:

```tsx
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';  // NEW COMPONENT — create below
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

export function Layout() {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen flex bg-dark-400">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main
        className={clsx(
          'flex-1 min-h-screen transition-all duration-300 ease-in-out',
          // Desktop: offset by sidebar width
          'md:ml-16',
          sidebarOpen ? 'md:ml-64' : 'md:ml-16',
          // Mobile: full width + bottom padding for nav bar
          'pb-20 md:pb-0'
        )}
      >
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="block md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
```

### 2.2 NEW: `src/components/layout/MobileNav.tsx`

Create this file. It is the bottom navigation bar for mobile PWA:

```tsx
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Brain, Target, BarChart3, Calculator,
} from 'lucide-react';
import { clsx } from 'clsx';

const mobileNavItems = [
  { path: '/',           label: 'Home',     icon: LayoutDashboard },
  { path: '/journal',    label: 'Journal',  icon: BookOpen },
  { path: '/playbooks',  label: 'AI',       icon: Brain },
  { path: '/propfirm',   label: 'Prop',     icon: Target },
  { path: '/reports',    label: 'Reports',  icon: BarChart3 },
  { path: '/calculator', label: 'Calc',     icon: Calculator },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-surface/95 backdrop-blur-md border-t border-surface-border',
        'flex items-center justify-around',
        'h-16 px-2',
        // iOS safe area
        'pb-[env(safe-area-inset-bottom)]',
      )}
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {mobileNavItems.map(({ path, label, icon: Icon }) => {
        const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
        return (
          <NavLink
            key={path}
            to={path}
            className={clsx(
              'flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 min-w-[52px] transition-all duration-200',
              isActive
                ? 'text-brand-400 bg-brand-500/10'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon className={clsx('w-5 h-5', isActive && 'drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]')} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
            {isActive && (
              <div className="absolute top-1 w-1 h-1 rounded-full bg-brand-400" />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
```

### 2.3 `Header.tsx` — Mobile-Responsive Header

The current header is `left-64`/`left-16` which breaks on mobile. Fix:

```tsx
// Replace the fixed className calculation:
<header className={clsx(
  'fixed top-0 right-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6',
  'bg-dark-400/90 backdrop-blur-md border-b border-surface-border',
  'transition-all duration-300',
  // Mobile: full width from left:0
  'left-0',
  // Desktop: offset by sidebar
  'md:left-16',
  sidebarOpen ? 'md:left-64' : 'md:left-16',
  // iOS safe area
  'pt-[env(safe-area-inset-top)]',
)}
style={{ height: 'calc(4rem + env(safe-area-inset-top))' }}
>
```

Also fix the page content `pt-16` → responsive:
```tsx
// In every page's top div, replace pt-16 with:
<div className="pt-16 md:pt-16" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>
```

The cleanest fix is to add a CSS variable. Add to `index.css`:
```css
:root {
  --header-height: calc(4rem + env(safe-area-inset-top));
}
```
Then use `style={{ paddingTop: 'var(--header-height)' }}` on every page's content wrapper.

---

## 3. Sidebar — Desktop Polish

### 3.1 Hover Tooltips When Collapsed

When `sidebarOpen === false`, nav items show only icons. Add Tooltip component. In `Sidebar.tsx`, wrap each icon-only `NavLink` with a tooltip that shows the label on hover:

```tsx
// Add this utility at the top of Sidebar.tsx
function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
        px-2.5 py-1.5 bg-surface-dark border border-surface-border rounded-lg
        text-xs font-medium text-white whitespace-nowrap shadow-card
        opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4
          border-transparent border-r-surface-border" />
      </div>
    </div>
  );
}
```

Wrap each collapsed nav item with `<Tooltip label={label}>…</Tooltip>` when `!sidebarOpen`.

### 3.2 Active State Visual Indicator

Add a left-edge accent bar to the active nav item when sidebar is expanded:

```tsx
// Inside the NavLink, add when isActive and sidebarOpen:
{isActive && (
  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-400 rounded-r-full" />
)}
// Make the NavLink position="relative" to contain this
```

### 3.3 Keyboard Navigation

Add `tabIndex={0}` and `onKeyDown` to the sidebar toggle button so it's keyboard accessible.

---

## 4. Dashboard Page — Pixel-Perfect Fixes

File: `src/pages/Dashboard.tsx`

### 4.1 Stat Cards — Consistent Height

The 6-card grid can have cards of unequal height because `value` strings differ in length. Fix by adding `h-full` and `min-h-[120px]` to `StatCard`:

```tsx
// In StatCard.tsx, update the root div:
<div className={clsx('card p-5 animate-fade-in flex flex-col justify-between min-h-[116px]', className)}>
```

### 4.2 Charts — Responsive Height on Mobile

Recharts containers with fixed `height={220}` overflow on small screens. Replace all hardcoded heights with responsive values:

```tsx
// Pattern for every chart container:
const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
// Or better — use a hook:
// src/hooks/useBreakpoint.ts
import { useState, useEffect } from 'react';
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// Then in each chart:
const isMobile = useIsMobile();
<EquityCurve height={isMobile ? 160 : 220} />
<PnLBarChart height={isMobile ? 140 : 180} />
```

### 4.3 Recent Trades Table — Mobile Scroll Container

The table currently hides columns with `hidden sm:table-cell` but the remaining columns can still overflow on very small screens. Fix the outer container:

```tsx
<div className="overflow-x-auto -mx-0 rounded-b-xl">
  <table className="w-full min-w-[360px]">
```

### 4.4 AI Insight Banner — Dismiss Animation

The current dismiss is abrupt (instant removal). Add exit animation:

```tsx
// Replace the dismissInsight button's behavior:
const [dismissing, setDismissing] = useState(false);

const handleDismiss = () => {
  setDismissing(true);
  setTimeout(() => dismissInsight(topInsight.id), 300);
};

// Apply to the banner div:
className={clsx(
  '...existing classes...',
  'transition-all duration-300',
  dismissing && 'opacity-0 scale-95 pointer-events-none'
)}
```

### 4.5 "View All" Button in Recent Trades

The current "View All" button does nothing. Wire it to navigate to `/journal`:

```tsx
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
// ...
<button className="btn-secondary text-xs py-1.5" onClick={() => navigate('/journal')}>
  View All
</button>
```

### 4.6 Streak Cards — Mobile Grid Fix

The bottom streak grid (`grid-cols-2 sm:grid-cols-4`) is fine but the cards should have consistent min-height to prevent ragged edges:

```tsx
// Each of the 4 streak/stat cards at the bottom:
<div className="card p-5 min-h-[100px]">
```

---

## 5. Trade Journal — Real Interactions

File: `src/pages/Journal.tsx`

### 5.1 Add Trade Form — Make It Functional

The "+ Add Trade" button in the header currently does nothing (it's in the Header component as a generic button). Wire it up:

**Step A** — Create `src/components/journal/AddTradeModal.tsx`:

```tsx
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Trade } from '../../types';
import { format } from 'date-fns';

const defaultTrade: Partial<Trade> = {
  symbol: 'XAUUSD',
  direction: 'BUY',
  entryPrice: 0,
  exitPrice: 0,
  stopLoss: 0,
  takeProfit: 0,
  lotSize: 0.1,
  strategy: 'ICT',
  session: 'London',
  emotion: 'Focused',
  emotionScore: 7,
  notes: '',
  tags: [],
  grade: 'B',
  commission: 2.5,
  swap: 0,
};

const symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'US30', 'NAS100', 'GBPJPY', 'AUDUSD'];
const strategies = ['Breakout', 'Mean Reversion', 'Trend Follow', 'Supply/Demand', 'ICT', 'SMC', 'Scalp', 'Swing'];
const sessions = ['London', 'New York', 'Tokyo', 'Overlap'];
const emotions = ['Confident', 'Focused', 'Calm', 'Anxious', 'FOMO', 'Neutral', 'Patient', 'Excited'];

interface Props {
  onClose: () => void;
}

export function AddTradeModal({ onClose }: Props) {
  const { addTrade } = useStore();
  const [form, setForm] = useState(defaultTrade);
  const [tagInput, setTagInput] = useState('');

  const set = (key: keyof Trade, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    const pnl = parseFloat(
      ((form.direction === 'BUY'
        ? (form.exitPrice! - form.entryPrice!)
        : (form.entryPrice! - form.exitPrice!)) * form.lotSize! * 100
      ).toFixed(2)
    );
    const status = pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BREAKEVEN';
    const slDist = Math.abs(form.entryPrice! - form.stopLoss!);
    const tpDist = Math.abs(form.takeProfit! - form.entryPrice!);
    const rr = slDist > 0 ? parseFloat((tpDist / slDist).toFixed(2)) : 1;

    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      symbol: form.symbol!,
      direction: form.direction!,
      entryPrice: form.entryPrice!,
      exitPrice: form.exitPrice!,
      stopLoss: form.stopLoss!,
      takeProfit: form.takeProfit!,
      lotSize: form.lotSize!,
      entryTime: new Date().toISOString(),
      exitTime: new Date().toISOString(),
      pnl,
      pnlPercent: parseFloat((pnl / 10000 * 100).toFixed(2)),
      rMultiple: rr,
      strategy: form.strategy!,
      session: form.session! as Trade['session'],
      emotion: form.emotion! as Trade['emotion'],
      emotionScore: form.emotionScore!,
      notes: form.notes!,
      tags: form.tags!,
      duration: 60,
      commission: form.commission!,
      swap: form.swap!,
      status,
      grade: form.grade!,
      riskReward: rr,
      maxDrawdown: 0,
      setup: form.strategy!,
      broker: 'Exness',
      account: 'PRO-10042',
    };

    addTrade(newTrade);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim()) {
      set('tags', [...(form.tags || []), tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-surface border border-surface-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-card-hover animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-surface z-10">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-400" />
            Log New Trade
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-light text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Symbol + Direction */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Symbol</label>
              <select className="select" value={form.symbol} onChange={e => set('symbol', e.target.value)}>
                {symbols.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Direction</label>
              <div className="flex gap-2">
                {(['BUY', 'SELL'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => set('direction', d)}
                    className={clsx(
                      'flex-1 py-2 rounded-lg text-sm font-bold border transition-all',
                      form.direction === d
                        ? d === 'BUY'
                          ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                          : 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-dark-300 text-slate-400 border-surface-border hover:border-slate-500'
                    )}
                  >
                    {d === 'BUY' ? '▲ BUY' : '▼ SELL'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'entryPrice', label: 'Entry Price' },
              { key: 'exitPrice', label: 'Exit Price' },
              { key: 'stopLoss', label: 'Stop Loss' },
              { key: 'takeProfit', label: 'Take Profit' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type="number"
                  className="input"
                  step="0.00001"
                  value={form[key as keyof typeof form] as number || ''}
                  onChange={e => set(key as keyof Trade, parseFloat(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>

          {/* Lot Size, Strategy, Session */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Lot Size</label>
              <input type="number" className="input" step="0.01" value={form.lotSize} onChange={e => set('lotSize', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="label">Strategy</label>
              <select className="select" value={form.strategy} onChange={e => set('strategy', e.target.value)}>
                {strategies.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Session</label>
              <select className="select" value={form.session} onChange={e => set('session', e.target.value)}>
                {sessions.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Emotion + Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Emotion</label>
              <select className="select" value={form.emotion} onChange={e => set('emotion', e.target.value)}>
                {emotions.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Grade</label>
              <div className="flex gap-1.5">
                {(['A','B','C','D','F'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => set('grade', g)}
                    className={clsx(
                      'flex-1 py-1.5 rounded text-xs font-bold border transition-all',
                      form.grade === g ? 'bg-brand-500/20 text-brand-300 border-brand-500/40' : 'bg-dark-300 text-slate-500 border-surface-border'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="Trade rationale, observations..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
              />
              <button onClick={addTag} className="btn-secondary px-3">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(form.tags || []).map(tag => (
                <span key={tag} className="px-2 py-1 bg-surface-light rounded-lg text-xs text-slate-400 border border-surface-border flex items-center gap-1">
                  #{tag}
                  <button onClick={() => set('tags', form.tags!.filter(t => t !== tag))} className="text-slate-600 hover:text-red-400 ml-1">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">
              <Plus className="w-4 h-4" />
              Log Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Note:** Import `clsx` at top of this file.

**Step B** — Wire the modal in `Journal.tsx`. Add state at the top:

```tsx
const [addTradeOpen, setAddTradeOpen] = useState(false);
```

Add this to the JSX near the top:

```tsx
{addTradeOpen && <AddTradeModal onClose={() => setAddTradeOpen(false)} />}
```

**Step C** — Update `Header.tsx` to accept and fire `onAddTrade` callback:

```tsx
// In Header props interface:
interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onAddTrade?: () => void;  // NEW
}

// In the "Add Trade" button:
<button className="btn-primary text-sm hidden sm:flex" onClick={onAddTrade}>
  <Plus className="w-4 h-4" />
  Add Trade
</button>
```

Pass `onAddTrade={() => setAddTradeOpen(true)}` to `<Header>` in `Journal.tsx`.

### 5.2 Delete Trade — Wire the Button

In `TradeDrawer`, add a delete button at the bottom:

```tsx
const { deleteTrade } = useStore();
// In the drawer footer, after existing content:
<div className="p-5 border-t border-surface-border">
  <button
    onClick={() => { deleteTrade(trade.id); onClose(); }}
    className="btn-danger w-full justify-center"
  >
    <Trash2 className="w-4 h-4" />
    Delete Trade
  </button>
</div>
```

Import `Trash2` from lucide-react.

### 5.3 Filter Bar — Make Filters Work

The search and filter state in `Journal.tsx` must actually filter the displayed trades. Ensure `useMemo` is correctly wired:

```tsx
const filtered = useMemo(() => {
  return trades.filter(t => {
    const matchSearch =
      !search ||
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.strategy.toLowerCase().includes(search.toLowerCase()) ||
      t.notes.toLowerCase().includes(search.toLowerCase());

    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchSymbol = !symbolFilter || t.symbol === symbolFilter;

    return matchSearch && matchStatus && matchSymbol;
  });
}, [trades, search, statusFilter, symbolFilter]);
```

Verify these filter state variables exist: `const [search, setSearch] = useState('')`, `const [statusFilter, setStatusFilter] = useState('')`, `const [symbolFilter, setSymbolFilter] = useState('')`.

Wire each to the search input and filter dropdowns `onChange` handlers.

### 5.4 Empty State

When `filtered.length === 0`, show an empty state:

```tsx
{filtered.length === 0 && (
  <div className="text-center py-16 text-slate-500">
    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
    <p className="font-medium text-slate-400">No trades found</p>
    <p className="text-sm mt-1">Try adjusting your filters or add a new trade</p>
  </div>
)}
```

---

## 6. Playbooks Page — Real Interactions

File: `src/pages/Playbooks.tsx`

### 6.1 "+ Create Playbook" Button

Currently does nothing. Create a minimal functional modal:

```tsx
const [createOpen, setCreateOpen] = useState(false);
```

The modal should have: Name input, Type selector (strategy/symbol/session), Description textarea, Rules (dynamic list — user can add/remove rules), and a Save button that calls `useStore().playbooks` setter.

Add to Zustand store in `useStore.ts`:
```ts
addPlaybook: (pb: Playbook) => set(state => ({ playbooks: [...state.playbooks, pb] })),
```

### 6.2 AI Generate Button

The `<Sparkles>` button at the top should trigger an actual AI call via the Anthropic API embedded in the artifact pattern (if the app is deployed as a Claude artifact). For standalone deployment, show a toast notification:

```tsx
const [generating, setGenerating] = useState(false);

const handleAIGenerate = async () => {
  setGenerating(true);
  // Simulate AI analysis of existing playbooks
  await new Promise(r => setTimeout(r, 2000));
  setGenerating(false);
  // Show success toast
  showToast('AI analysis complete — 2 new insights generated');
};
```

### 6.3 Toast Notification System

Create `src/components/ui/Toast.tsx` for app-wide toast notifications:

```tsx
import { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, X, AlertTriangle, Info } from 'lucide-react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: string; message: string; type: ToastType; }

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const icons = { success: CheckCircle2, error: X, info: Info, warning: AlertTriangle };
  const colors = {
    success: 'border-brand-500/40 bg-brand-500/10 text-brand-300',
    error: 'border-red-500/40 bg-red-500/10 text-red-300',
    info: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card',
                'animate-slide-up pointer-events-auto backdrop-blur-sm',
                'bg-surface/95',
                colors[toast.type]
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium text-white">{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
```

Wrap `App.tsx` root with `<ToastProvider>`.

---

## 7. Notebook — Real Create/Edit/Delete

File: `src/pages/Notebook.tsx`

### 7.1 "+ New Entry" Button

Must open a real editor. Create `src/components/notebook/NoteEditor.tsx`:

- Title input
- Type selector (Note / Rule / Setup / Lesson / Checklist)
- Content textarea with basic markdown hints
- Tags input (same pattern as trade tags)
- Pin toggle
- Save (calls `addNotebookEntry`) + Cancel

### 7.2 Edit Button on Cards

Each notebook card should have an edit (pencil) icon that opens the same `NoteEditor` pre-filled with existing content. On save, calls `updateNotebookEntry`.

### 7.3 Delete Button on Cards

Show a confirmation dialog before deleting. Inline confirmation (not a full modal):

```tsx
const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

// On card, show:
{confirmDelete === entry.id ? (
  <div className="flex gap-2">
    <button onClick={() => { deleteNotebookEntry(entry.id); setConfirmDelete(null); }}
      className="text-xs text-red-400 hover:text-red-300 font-medium">Confirm</button>
    <button onClick={() => setConfirmDelete(null)}
      className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
  </div>
) : (
  <button onClick={() => setConfirmDelete(entry.id)} className="p-1.5 rounded hover:bg-surface-border text-slate-500 hover:text-red-400">
    <Trash2 className="w-3.5 h-3.5" />
  </button>
)}
```

### 7.4 Pin Functionality

The `pinned` field exists on `NotebookEntry`. Make pinned entries visually distinct and sorted to the top:

```tsx
const sorted = useMemo(() => {
  const filtered = notebook.filter(n => /* apply search/type filter */);
  return [...filtered.filter(n => n.pinned), ...filtered.filter(n => !n.pinned)];
}, [notebook, /* filter deps */]);
```

Pinned cards get a visual treatment:
```tsx
{entry.pinned && (
  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-400 shadow-glow-sm" />
)}
```

---

## 8. Risk Calculator — Real-Time Feedback

File: `src/pages/Calculator.tsx`

The calculator logic is already correct. These are UX improvements:

### 8.1 Visual RR Meter

Replace the text-based RR display with a visual gauge:

```tsx
// Below the RR ratio display, add:
<div className="mt-3">
  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
    <span>Risk</span>
    <span>1:{calc.rr} Reward</span>
  </div>
  <div className="h-3 bg-dark-300 rounded-full overflow-hidden border border-surface-border">
    {/* Risk portion — always 1 unit */}
    <div className="h-full flex">
      <div className="bg-red-500/60 rounded-l-full" style={{ width: `${(1 / (1 + calc.rr)) * 100}%` }} />
      <div className={clsx('rounded-r-full flex-1', calc.isGoodRR ? 'bg-brand-500/70' : 'bg-amber-500/60')} />
    </div>
  </div>
  <div className="flex items-center justify-between text-xs mt-1">
    <span className="text-red-400">Risk: ${calc.riskAmount}</span>
    <span className={calc.isGoodRR ? 'text-brand-400' : 'text-amber-400'}>
      Reward: ${calc.potentialProfit}
    </span>
  </div>
</div>
```

### 8.2 Lot Size Copy Button

Add a copy-to-clipboard button next to the lot size output:

```tsx
import { Copy, Check } from 'lucide-react';
const [copied, setCopied] = useState(false);

const copyLotSize = () => {
  navigator.clipboard.writeText(calc.lotSize.toString());
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

// Next to lot size display:
<button onClick={copyLotSize} className="p-1.5 rounded hover:bg-surface-border text-slate-400 hover:text-white transition-colors">
  {copied ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
</button>
```

### 8.3 Preset Buttons — Highlight Active

Ensure the preset risk buttons visually show which is selected:

```tsx
{presetRisks.map(r => (
  <button
    key={r}
    onClick={() => setRiskPercent(r)}
    className={clsx(
      'px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all',
      riskPercent === r
        ? 'bg-brand-500/20 text-brand-400 border-brand-500/40 shadow-glow-sm'
        : 'bg-dark-300 text-slate-400 border-surface-border hover:border-slate-500'
    )}
  >
    {r}%
  </button>
))}
```

---

## 9. Prop Firm Page — Visual Enhancements

File: `src/pages/PropFirm.tsx`

### 9.1 Drawdown Warning Pulse

When `drawdownPct > 70`, the drawdown progress bar should pulse red to alert the user:

```tsx
<div className={clsx(
  'h-3 rounded-full transition-all duration-700',
  drawdownPct > 70 ? 'animate-pulse' : '',
  // color based on risk level
  drawdownPct > 80 ? 'bg-red-500' :
  drawdownPct > 60 ? 'bg-amber-500' :
  'bg-brand-500'
)} style={{ width: `${Math.min(drawdownPct, 100)}%` }} />
```

### 9.2 Days Counter — Live Countdown

The days remaining should update in real time using a live calculation, not static mock data:

```tsx
const daysRemaining = differenceInDays(new Date(propChallenge.endDate), new Date());
const isExpiringSoon = daysRemaining <= 3;

// Display:
<div className={clsx(
  'text-2xl font-bold',
  isExpiringSoon ? 'text-red-400 animate-pulse' : 'text-white'
)}>
  {daysRemaining > 0 ? daysRemaining : 0}
</div>
```

---

## 10. Settings Page — Wire Save Actions

File: `src/pages/Settings.tsx`

### 10.1 "Save Changes" Button — Toast Feedback

```tsx
const { showToast } = useToast();

const handleSave = () => {
  // In a real app, this would call the API
  // For now: optimistic update + toast
  showToast('Settings saved successfully');
};

<button className="btn-primary mt-4" onClick={handleSave}>Save Changes</button>
```

### 10.2 Broker Connection Buttons — Toggle State

```tsx
const [connectedBrokers, setConnectedBrokers] = useState(['Exness']);

const toggleBroker = (name: string) => {
  setConnectedBrokers(prev =>
    prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]
  );
  showToast(connectedBrokers.includes(name) ? `${name} disconnected` : `${name} connected`);
};
```

### 10.3 Notification Toggles — Real Toggle UI

The notification toggles should be styled toggle switches, not just checkboxes:

```tsx
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={clsx(
        'relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none',
        checked ? 'bg-brand-500' : 'bg-surface-border'
      )}
    >
      <div className={clsx(
        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm',
        checked ? 'translate-x-5' : 'translate-x-0.5'
      )} />
    </button>
  );
}
```

---

## 11. Reports Page — Download Button

File: `src/pages/Reports.tsx`

### 11.1 PDF Export — Working Implementation

The PDF export button should trigger a real print dialog (browser's built-in print to PDF):

```tsx
const handleExport = () => {
  window.print();
};
```

Add print-specific CSS to `index.css`:

```css
@media print {
  .no-print { display: none !important; }
  body { background: white !important; color: black !important; }
  .card { border: 1px solid #e2e8f0 !important; box-shadow: none !important; }
}
```

Add `className="no-print"` to the sidebar, header, and any non-report elements. The page content will print cleanly.

---

## 12. Global UI Polish

### 12.1 Loading States

Add skeleton loaders so the app never shows blank white flash on initial load. Create `src/components/ui/Skeleton.tsx`:

```tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx(
      'bg-surface-border rounded-lg animate-pulse',
      className
    )} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5 min-h-[116px]">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
```

### 12.2 Focus States — Keyboard Accessibility

Every interactive element must have a visible focus ring. Add to `index.css`:

```css
@layer base {
  :focus-visible {
    outline: 2px solid theme('colors.brand.500');
    outline-offset: 2px;
    border-radius: 6px;
  }
}
```

### 12.3 Scroll Restoration

Add this to `App.tsx` to restore scroll position on navigation:

```tsx
import { ScrollRestoration } from 'react-router-dom';
// Inside BrowserRouter, before Routes:
<ScrollRestoration />
```

### 12.4 Page Transition Animation

Add a smooth fade when navigating between pages. Wrap `<Outlet />` in `Layout.tsx`:

```tsx
import { useLocation } from 'react-router-dom';

const location = useLocation();

// Wrap Outlet:
<div key={location.pathname} className="animate-fade-in min-h-screen">
  <Outlet />
</div>
```

### 12.5 Error Boundary

Add a React error boundary to prevent white screen crashes. Create `src/components/ErrorBoundary.tsx`:

```tsx
import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="card p-8 max-w-md w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-4">{this.state.error?.message}</p>
            <button
              className="btn-primary mx-auto"
              onClick={() => window.location.reload()}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Wrap `App.tsx` root with `<ErrorBoundary>`.

---

## 13. `index.css` — Design System Improvements

### 13.1 Add Missing Utility Classes

Append to the `@layer components` block:

```css
/* Toggle switch */
.toggle-track {
  @apply relative w-10 h-5 rounded-full transition-colors duration-200;
}
.toggle-thumb {
  @apply absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm;
}

/* Drag handle */
.drag-handle {
  @apply w-8 h-1 bg-surface-border rounded-full mx-auto mb-4 cursor-grab;
}

/* Sheet overlay */
.sheet-overlay {
  @apply fixed inset-0 z-40 bg-black/60 backdrop-blur-sm;
}

/* Empty state */
.empty-state {
  @apply text-center py-16 text-slate-500;
}

/* Divider */
.divider {
  @apply border-t border-surface-border my-4;
}

/* Chip/tag */
.chip {
  @apply inline-flex items-center gap-1 px-2.5 py-1 bg-surface-light rounded-full text-xs font-medium text-slate-300 border border-surface-border;
}

/* Modal backdrop */
.modal-backdrop {
  @apply fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4;
}

/* Code block */
.code {
  @apply font-mono text-xs bg-dark-300 border border-surface-border rounded px-1.5 py-0.5 text-brand-300;
}
```

### 13.2 Scrollbar in Dark Mode

Ensure the custom scrollbar is consistently applied:

```css
* {
  scrollbar-width: thin;
  scrollbar-color: theme('colors.surface.border') transparent;
}
```

---

## 14. `App.tsx` — Final Wiring

Update `App.tsx` to include all new providers and components:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Journal } from './pages/Journal';
import { Playbooks } from './pages/Playbooks';
import { PropFirm } from './pages/PropFirm';
import { Notebook } from './pages/Notebook';
import { Reports } from './pages/Reports';
import { Calculator } from './pages/Calculator';
import { Settings } from './pages/Settings';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/playbooks" element={<Playbooks />} />
              <Route path="/propfirm" element={<PropFirm />} />
              <Route path="/notebook" element={<Notebook />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
```

---

## 15. Zustand Store Updates

Add these missing actions to `src/store/useStore.ts`:

```ts
// Add to AppState interface:
addPlaybook: (pb: Playbook) => void;
updatePlaybook: (id: string, updates: Partial<Playbook>) => void;
deletePlaybook: (id: string) => void;

// Add to create() call:
addPlaybook: (pb) => set(state => ({ playbooks: [pb, ...state.playbooks] })),
updatePlaybook: (id, updates) => set(state => ({
  playbooks: state.playbooks.map(p => p.id === id ? { ...p, ...updates } : p)
})),
deletePlaybook: (id) => set(state => ({ playbooks: state.playbooks.filter(p => p.id !== id) })),
```

---

## 16. Execution Order

Run these changes in this exact order to avoid compilation errors:

1. `src/index.css` — add all new utility classes and safe area CSS
2. `index.html` — replace full head block
3. `vite.config.ts` — update PWA manifest
4. `src/store/useStore.ts` — add missing actions
5. `src/components/ui/Skeleton.tsx` — create file
6. `src/components/ui/Toast.tsx` — create file
7. `src/components/ErrorBoundary.tsx` — create file
8. `src/hooks/useBreakpoint.ts` — create file
9. `src/components/layout/MobileNav.tsx` — create file
10. `src/components/layout/Layout.tsx` — update with MobileNav
11. `src/components/layout/Header.tsx` — mobile fix + onAddTrade prop
12. `src/components/layout/Sidebar.tsx` — tooltips + active bar
13. `src/components/ui/StatCard.tsx` — min-height fix
14. `src/App.tsx` — final wiring with providers
15. `src/pages/Dashboard.tsx` — chart heights + view all button + dismiss animation
16. `src/components/journal/AddTradeModal.tsx` — create file
17. `src/pages/Journal.tsx` — add trade modal + delete + filters + empty state
18. `src/pages/Playbooks.tsx` — create playbook + AI generate button
19. `src/pages/Notebook.tsx` — create/edit/delete notes + pin
20. `src/pages/Calculator.tsx` — RR meter + copy button + preset highlights
21. `src/pages/PropFirm.tsx` — drawdown pulse + live days
22. `src/pages/Settings.tsx` — save toast + broker toggles + toggle UI
23. `src/pages/Reports.tsx` — print export

---

## 17. Verification Checklist

After all changes, verify every item in this checklist:

### PWA
- [ ] Chrome DevTools → Application → Manifest — no errors or warnings
- [ ] Chrome DevTools → Application → Service Workers — registered and activated
- [ ] "Install" button appears in Chrome address bar
- [ ] After install, app opens in standalone mode (no browser chrome)
- [ ] App icon appears correctly on Android home screen
- [ ] App icon appears correctly on iOS home screen (add to Home Screen)
- [ ] Status bar color matches `#0b0f16` on iOS
- [ ] No layout overflow when status bar is visible in standalone mode
- [ ] Offline: app loads from cache when network is unavailable

### Mobile (375px viewport — iPhone SE)
- [ ] Bottom nav bar is visible and tappable on all 6 routes
- [ ] Sidebar does NOT appear on mobile
- [ ] Header title is visible and not clipped
- [ ] All stat cards are fully visible without horizontal scroll
- [ ] Trade journal table scrolls horizontally without page overflow
- [ ] All modals open from bottom (slide-up sheet)
- [ ] Calculator inputs are focusable and keyboard does not cover the output
- [ ] Touch targets are minimum 44×44px for all buttons

### Desktop (1280px+ viewport)
- [ ] Sidebar collapses/expands with smooth animation
- [ ] Collapsed sidebar shows tooltips on hover
- [ ] Header date range selector is visible
- [ ] All 6-column stat card grid renders correctly
- [ ] Chart heights are correct (220px for equity curve)
- [ ] Modal overlays cover full viewport

### Interactions
- [ ] "+ Add Trade" button opens the AddTradeModal
- [ ] Adding a trade updates the Dashboard recent trades table in real time
- [ ] Deleting a trade from the TradeDrawer removes it from the journal
- [ ] Search + filters in Journal show correct results
- [ ] "View All" on Dashboard navigates to /journal
- [ ] Pin button on Notebook entries moves them to top
- [ ] Delete with confirm-inline works on Notebook entries
- [ ] Calculator updates live as any input changes
- [ ] Risk preset buttons (0.5%, 1%, 1.5%, 2%) correctly highlight active
- [ ] Lot size copy button shows checkmark after click
- [ ] Toast notifications appear and auto-dismiss after 3.5s
- [ ] Dismiss on AI Insight banner fades out smoothly
- [ ] Settings "Save Changes" shows success toast
- [ ] PDF export button opens print dialog

### Visual Quality
- [ ] No layout shift on page load (fonts are preloaded)
- [ ] All chart tooltips are styled (dark background, rounded, correct colors)
- [ ] Active nav items have green glow accent
- [ ] Profit values are green (`text-brand-400`), loss values are red (`text-red-400`)
- [ ] All cards have consistent 20px padding
- [ ] Modals have backdrop blur
- [ ] No horizontal scroll on any page at 375px
- [ ] Scrollbar is styled (6px, dark, rounded)
- [ ] All inputs have focus ring on keyboard focus
- [ ] Empty state renders when no results match filter

### Performance
- [ ] Lighthouse PWA score: 90+
- [ ] Lighthouse Performance score: 85+ (mobile)
- [ ] Console shows zero errors in production build
- [ ] `npm run build` completes with zero TypeScript errors

---

## 18. Known Existing Issues to Fix (Pre-Documented)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `Layout.tsx` | `ml-64`/`ml-16` breaks on mobile | Replace with responsive `MobileNav` pattern (Section 2) |
| 2 | `Header.tsx` | `left-64` hardcoded, breaks on mobile | Dynamic `left-0 md:left-[sidebar-width]` (Section 2.3) |
| 3 | `Dashboard.tsx` | "View All" button unclickable | Wire to `navigate('/journal')` (Section 4.5) |
| 4 | `Journal.tsx` | "+ Add Trade" button does nothing | Wire `AddTradeModal` (Section 5.1) |
| 5 | `Journal.tsx` | Filters wired to state but `filtered` may not be in use | Ensure `useMemo` filtered list is rendered (Section 5.3) |
| 6 | `Playbooks.tsx` | "+ Create Playbook" button does nothing | Wire modal (Section 6.1) |
| 7 | `Notebook.tsx` | "New Entry" button does nothing | Wire `NoteEditor` (Section 7.1) |
| 8 | `Settings.tsx` | "Save Changes" has no feedback | Toast on click (Section 10.1) |
| 9 | `Calculator.tsx` | Risk preset buttons always same style | Highlight active preset (Section 8.3) |
| 10 | `index.html` | Missing Apple PWA meta tags | Full head replacement (Section 1.1) |
| 11 | `Sidebar.tsx` | Collapsed icons have no tooltip | Add Tooltip component (Section 3.1) |
| 12 | All pages | `pt-16` doesn't account for iOS safe area | CSS variable `--header-height` (Section 2.3) |
| 13 | All charts | Fixed `height={220}` overflows on mobile | Responsive height via `useIsMobile()` (Section 4.2) |
| 14 | `App.tsx` | No error boundary | Add `ErrorBoundary` (Section 12.5) |
| 15 | All pages | No toast system | Add `ToastProvider` (Section 6.3) |

---

## References

- **Design system tokens:** `frontend/tailwind.config.js` — use existing `brand`, `dark`, `surface` tokens exclusively
- **Component classes:** `frontend/src/index.css` — use `.card`, `.btn-primary`, `.input`, `.label` etc.
- **State management:** `frontend/src/store/useStore.ts` — all state lives here, do not create local storage
- **Types:** `frontend/src/types/index.ts` — all TypeScript interfaces defined here
- **Mock data:** `frontend/src/data/mockData.ts` — do NOT modify
- **PWA config:** `frontend/vite.config.ts` — update only the `manifest` and `workbox` keys
- **Base path:** `'/Tradex/'` in production — all asset paths must be relative or use `import.meta.env.BASE_URL`
