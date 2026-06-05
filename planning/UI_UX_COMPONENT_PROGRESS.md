# TradeX Pixel-Perfect iOS 26 Component System — Progress

**Branch:** `cursor/pixel-perfect-ios26-977a`  
**PR:** https://github.com/ruddvz/Tradex/pull/39  
**Last updated:** 2026-06-05 (honest audit pass)

## Honest status

**Not every spec file path exists as a standalone module.** Many §5 paths are satisfied by behavior (inline page UI, aliases, or shared `TxField.tsx`). The app is **functionally aligned** with navigation, safety copy, tokens, and mobile shell — but **full pixel-perfect migration of every `.card` / `.btn-*` to `TxCard` / `TxButton` across all pages is still partial**.

## Completed in audit pass (round 2)

- [x] Removed `App.css` starter file; removed Google Fonts from `index.html` (system font stack only)
- [x] Fixed `ModeHeaderStrip` clearance under fixed header (`mt-[var(--tx-header-h)]`)
- [x] `Header` mobile: max 2 icon actions, kill switch only on Bot/Risk routes, `TxIconButton`
- [x] `MoreGrid` → 2-column card grid per §9.3; `MorePageLink`; More status card
- [x] `DateRangeToolbar` wired on Today + Reports; date range removed from mobile Today hero
- [x] `ReportHero` + low-sample warning on Reports; `TxPage` on Reports/Journal
- [x] `Auth` → `TxCard` / `TxInput` / `TxButton` + trust note
- [x] `LiveReadiness` required §34.2 copy
- [x] Journal: compact header, `BottomActionBar` add trade, `TxSearchField`, `TradeFilterSheet`, demo banner
- [x] Dashboard: spec imports (`TodayHero`, `RiskPulseCard`, `NextActionCard`); mobile above-fold trim
- [x] Sidebar 264px/82px tokens; Action Center in Control group
- [x] Spec path re-exports: `TxInput`, `TxSelect`, `TxTextarea`, `TxSearchField`, `AppShell`, reports partial
- [x] `./scripts/verify.sh` green (e2e journal test updated for compact header)

## Still partial (known gaps)

- [ ] `TradeDrawer` still inline in `Journal.tsx` (not extracted to `components/journal/TradeDrawer.tsx`)
- [ ] `PaperTrading` / `RiskCenter` — order/limits UI inline, not split into §5 paper/risk card files
- [ ] Many pages still use legacy `.card` / `.btn-primary` (Reports charts, Prop Firm, etc.)
- [ ] `TxCard` not adopted on every surface (intentional gradual migration)
- [ ] Physical iPhone PWA screenshots (`planning/DEVICE-QA.md`)

## Phase checklist

| Phase | Status |
|-------|--------|
| 0 Verify | ✅ |
| 1 Tokens/CSS | ✅ |
| 2 Tx primitives | ✅ (bundled form fields + aliases) |
| 3 Shell/nav | ✅ (PageToolbar wired) |
| 4 Today | ✅ mobile hierarchy improved |
| 5 Journal | 🟡 filter sheet + bottom CTA; drawer inline |
| 6 Paper Bot | 🟡 existing bot cards; not all §5 filenames |
| 7 Risk | 🟡 existing hero; inline limits |
| 8 Secondary routes | 🟡 Reports/Auth/Landing/More improved |
| 9 Charts | 🟡 `charts.css`; legacy chart wrappers remain |
| 10 QA | ✅ verify.sh; device QA human |

## Checks

- [x] `npm run format:check` / `lint` / `build`
- [x] `./scripts/verify.sh`
