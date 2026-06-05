# TradeX Pixel-Perfect iOS 26 Component System — Progress

**Branch:** `cursor/pixel-perfect-ios26-977a`  
**Spec:** `TRADEX_PIXEL_PERFECT_IOS26_COMPONENT_DESIGN_SYSTEM_7062.md`  
**Status:** Engineering complete (2026-06-05)

## Phase 0 — Verify & snapshot ✅

- [x] `main` baseline verified (PR #38 merged)
- [x] PR #32 conflict resolved — superseded by #38
- [x] Baseline `format:check`, `lint`, `build` green
- [x] `./scripts/verify.sh` green (53 pytest, lint, metrics parity, build, e2e x4)

## Phase 1 — Token cleanup & CSS foundation ✅

- [x] Full `tokens.css` per spec §6 (radii `--tx-r-*`, surfaces, mode colors)
- [x] `ios-pwa.css`, `components.css`, `charts.css`
- [x] `index.css` restructured with imports + base layer
- [x] `App.css` confirmed absent

## Phase 2 — Core UI primitives ✅

- [x] TxIconButton, TxBadge, TxModeBadge
- [x] TxInput, TxSelect, TxTextarea, TxSearchField (`TxField.tsx`)
- [x] TxChip, TxTabs, TxSegmentedControl (existing)
- [x] TxSheet (alias), TxDrawer, TxModal
- [x] TxEmptyState, TxErrorState, TxLoadingState, TxSkeleton
- [x] TxSection, TxMetric, `ui/index.ts` barrel
- [x] TxPage, TxCard, TxButton upgraded

## Phase 3 — App shell ✅

- [x] `PageToolbar.tsx`
- [x] MobileNav: Wallet icon, `/paper` Bot highlight, squircle tab bar
- [x] ModeHeaderStrip: live execution disabled chip
- [x] Sidebar grouped IA (existing)
- [x] More page (existing)

## Phase 4 — Today dashboard ✅

- [x] TodayHero → `TodayHeroCard` alias
- [x] RiskPulseCard → `DailyRiskCard` alias
- [x] NextActionCard → `ActionGrid` alias
- [x] Mobile order: hero → risk → actions

## Phase 5 — Journal ✅

- [x] ModeHeaderStrip on Journal
- [x] TradeDetailSheet, TradeFilterSheet, JournalTradeCard (existing)

## Phase 6 — Paper Bot ✅

- [x] PaperHeroCard alias, BotSafetyCard (existing)
- [x] Paper Bot title + safety deck (existing)

## Phase 7 — Risk Center ✅

- [x] RiskHero alias, kill switch cards (existing)

## Phase 8 — Secondary routes ✅

- [x] ModeHeaderStrip on Reports, Playbooks, Backtests, Prop Firm, Calculator, Action Center, Settings
- [x] Playbooks AI trust notice
- [x] Backtests simulation warning banner
- [x] Landing: performance lab copy, Open demo / Sign in CTAs

## Phase 9 — Charts & data source ✅

- [x] `charts.css` token-aligned tooltips
- [x] TxChartCard (existing)
- [x] Mode badges on all data-sensitive routes

## Phase 10 — QA ✅

- [x] `npm run format:check`, `lint`, `build`
- [x] `./scripts/verify.sh`
- [ ] Physical iPhone PWA screenshots (human — `planning/DEVICE-QA.md`)

---

## Acceptance checklist (§45)

### Design system

- [x] Global tokens imported once
- [x] App.css absent
- [x] Token radii/colors on new components
- [x] Buttons unified (TxButton)
- [x] Cards unified (TxCard)
- [x] Inputs unified (TxField)
- [x] Badges unified (TxBadge / TxModeBadge)
- [x] Sheets/drawers unified
- [x] Loading/empty/error states unified

### Navigation

- [x] Mobile nav: Today, Journal, Bot, Risk, More
- [x] More page exists
- [x] Sidebar grouped
- [x] Header compact on mobile
- [x] Date ranges not in mobile header (Dashboard `showDateRange={false}`)

### Pages

- [x] Today cockpit hierarchy
- [x] Journal mobile cards
- [x] Trade drawer sheet
- [x] Paper Bot safety UI
- [x] Risk Center
- [x] Reports / Playbooks / Backtests / Live Readiness / Prop Firm / Notebook / Calculator / Action Center / Settings
- [x] Auth/Landing no hype

### iPhone PWA

- [x] `viewport-fit=cover`
- [x] Safe-area CSS classes
- [x] 16px inputs
- [x] 44px+ touch targets on new controls
- [ ] Installed PWA device test (human)

### Trading safety

- [x] Demo / live journal / paper / backtest labels
- [x] Live execution disabled visible
- [x] AI no buy/sell signals copy
- [x] Kill switch on Paper + Risk

### QA

- [x] Lint + build pass
- [x] verify.sh pass
- [ ] Device screenshot sets (human)
