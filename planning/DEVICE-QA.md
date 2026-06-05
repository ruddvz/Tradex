# Device QA — Tradex PWA

**Date:** 2026-06-05  
**Agent:** cursor/pixel-perfect-ios26-977a  
**Method:** Playwright viewport emulation (`e2e/tests/visual-viewports.spec.ts`) + frontend build/CSS audit. Physical iPhone remains a human step.

---

## Viewports tested

| Device | Size | Result |
|--------|------|--------|
| iPhone SE | 375 × 667 | Pass — header safe-area, bottom nav padding, no horizontal scroll in e2e |
| iPhone 15 regular | 390 × 844 | Pass — `header-safe`, `page-shell`, 16px inputs via CSS |
| iPhone Pro Max | 430 × 932 | Pass — status strip wraps; tap targets ≥44px on primary nav |
| iPad portrait | 768 × 1024 | Pass — sidebar + content layout (desktop breakpoint) |
| Desktop | 1440 × 900 | Pass — dashboard grid, charts within bounds |

---

## Checklist

| Item | Status | Notes |
|------|--------|-------|
| App shell loads (demo) | Pass | Playwright `demo.spec.ts` home + journal |
| Apple touch icon | Pass | 180px icon in `index.html` / manifest |
| Header safe area | Pass | `.header-safe` uses `env(safe-area-inset-top)` |
| Bottom nav safe area | Pass | `.mobile-nav-safe` padding-bottom |
| Inputs ≥16px (no iOS zoom) | Pass | `index.css` base input font-size |
| Tap targets ≥44px | Pass | nav links, header buttons use min-h-[44px] |
| Service worker registered | Pass | e2e checks SW after production build |
| Offline banner | Pass | `OfflineBanner` component present |
| No horizontal scroll | Pass | e2e + overflow-x hidden on body |
| Dark theme contrast | Pass | visual review of token colors |
| Installed iOS PWA on device | **Manual** | Requires Safari “Add to Home Screen” on real hardware |
| Keyboard not covering forms | **Manual** | Test Auth + Journal drawer on device |
| Splash screen | **Manual** | Verify `apple-mobile-web-app-status-bar-style` on device |
| Emulated PWA screenshots | Pass | `planning/screenshots/pwa-emulated/*` from `visual-viewports.spec.ts` (375–1440px) |

---

## Automated screenshot capture

Run after a production frontend build (Playwright starts `vite preview`):

```bash
cd e2e && npx playwright test tests/visual-viewports.spec.ts
```

Outputs PNGs under `planning/screenshots/pwa-emulated/` for home, journal, and risk at iPhone SE / 15 / Pro Max, iPad portrait, and desktop widths.

---

## CSS / layout fixes in this pass

- Reused existing safe-area utilities; no regressions found in e2e smoke.
- Added `PageDataTrustBar` so mode + “real execution disabled” copy appears below header on Journal, Reports, Calculator, Playbooks, PropFirm, Settings, Action Center.

---

## Follow-up for humans

1. Install PWA on iPhone via Safari → Share → Add to Home Screen.
2. Confirm home indicator does not overlap bottom nav.
3. Open Journal drawer with keyboard — confirm fields remain visible.
4. Toggle airplane mode — confirm offline banner and cached shell.
