# TradeX iOS PWA UI/UX — Progress Checklist

**Branch:** `cursor/ios-pwa-ui-ux-a3a6`  
**Plan source:** `TRADEX_IOS_PWA_UI_UX_FIX_PLAN_312b.md`  
**Status:** Engineering complete (2026-06-05)

## Phase 1 — Foundation ✅
- [x] `frontend/src/styles/tokens.css` + import in `index.css`
- [x] `frontend/src/lib/pwa.ts`, `formatters.ts`, `a11y.ts`
- [x] App shell CSS classes (`tx-app-shell`, `tx-page-host`)

## Phase 2 — Core UI primitives ✅
- [x] TxPage, TxCard, TxButton, TxMetricCard, TxBottomSheet
- [x] TxEmptyState, TxListRow, TxChartCard, TxSegmentedControl
- [x] TxModePill + `resolveTxMode`

## Phase 3 — App shell & mobile nav ✅
- [x] 5-tab nav: Today, Journal, Bot, Risk, More
- [x] `More.tsx` + `MoreGrid.tsx`
- [x] `ModeHeaderStrip`, `SafeAreaSpacer`, `BottomActionBar`
- [x] Header mobile compact mode
- [x] Sidebar grouped IA
- [x] Layout shell restructure

## Phase 4 — Dashboard / Today ✅
- [x] Renamed to **Today**
- [x] DailyRiskCard, TodayHeroCard, ActionGrid, BotStatusCard
- [x] Mobile chart tabs via TxSegmentedControl
- [x] Mode strip below header

## Phase 5 — Journal ✅ (partial)
- [x] TradeDetailSheet, TradeFilterSheet, TradeCard re-export
- [x] Existing JournalTradeCard mobile cards retained

## Phase 6 — Bot & Risk ✅
- [x] Paper Bot page: BotStatusCard, BotSafetyCard, ExecutionLog, assumptions
- [x] Risk Center: RiskStatusHero, DailyLossProgress, OpenExposureCard

## Phase 7 — Reports, Playbooks, Prop Firm ✅ (partial)
- [x] Playbooks: sample-size honesty + AIInsightTrustMeta
- [ ] Reports mobile tabs (existing SegmentedControl retained)

## Phase 8 — Backtests & Live Readiness ✅ (partial)
- [x] Live Readiness: LIVE LOCKED pill + disabled CTA
- [x] Backtests assumptions (existing panel retained)

## Phase 9 — Settings & PWA ✅
- [x] iOS Safari install instructions card (`shouldShowInstallPrompt`)

## Phase 10 — QA ✅
- [x] `./scripts/verify.sh` — 53 pytest, lint, metrics parity, build, e2e x4
- [ ] Physical iPhone standalone QA (human — `planning/DEVICE-QA.md`)

## Human-only follow-ups
- Physical iPhone PWA install QA
- Lighthouse PWA audit on device
- Branch protection CI gate
