# TradeX Pixel-Perfect iOS 26 Component System — Progress

**Branch:** `cursor/pixel-perfect-ios26-977a`  
**PR:** https://github.com/ruddvz/Tradex/pull/39  
**Last updated:** 2026-06-05 (completion pass)

## Honest status

Core §5 extractions and `TxCard` migration for primary app surfaces are **done**. Marketing (`Landing.tsx`), legacy routes (`Paper.tsx`, `Settings`, `Backtests`), and a few shared skeletons still use `.card` where not in scope for this pass.

## Completed (completion pass)

- [x] `TradeDrawer` + `ScreenshotUploadZone` extracted under `components/journal/`
- [x] `JournalFilterBar` with `TxChip` filter rail
- [x] Paper §5 files: `PaperOrderTicket`, `PaperOrdersCard`, `PaperPositionsCard`, `PaperRejectedCard`, `PaperAccountSwitcher`, `PaperHeroCard`, `PaperAssumptionsCard`, `ExecutionLogCard`
- [x] Risk §5 files: `KillSwitchCard`, `RiskLimitsCard`, `RiskViolationCard`, `RiskEventTimeline`
- [x] `PaperTrading.tsx` / `RiskCenter.tsx` composed from extracted cards
- [x] Reports: `ReportMetricGrid`, `ReportInsightCard`, all chart blocks on `TxCard`
- [x] Dashboard desktop chart grid on `TxCard`
- [x] Prop Firm + Notebook note cards on `TxCard`
- [x] Emulated PWA screenshots: `e2e/tests/visual-viewports.spec.ts` → `planning/screenshots/pwa-emulated/`

## Still manual / out of scope

- [ ] Physical iPhone PWA install + keyboard/splash checks (`planning/DEVICE-QA.md`)
- [ ] Gradual `.card` on Landing, Settings, Backtests, Playbooks, Calculator, skeletons

## Phase checklist

| Phase | Status |
|-------|--------|
| 0 Verify | ✅ |
| 1 Tokens/CSS | ✅ |
| 2 Tx primitives | ✅ |
| 3 Shell/nav | ✅ |
| 4 Today | ✅ |
| 5 Journal | ✅ drawer + filter bar extracted |
| 6 Paper Bot | ✅ §5 card files |
| 7 Risk | ✅ §5 card files |
| 8 Secondary routes | ✅ Reports/PropFirm/Notebook TxCard |
| 9 Charts | ✅ Reports/Dashboard wrappers |
| 10 QA | ✅ verify.sh + emulated viewport PNGs |

## Checks

- [x] `npm run lint` / `build`
- [x] `./scripts/verify.sh`
- [x] `visual-viewports.spec.ts` (generates screenshot set)
