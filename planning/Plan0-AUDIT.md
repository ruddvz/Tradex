# Plan0 — Pre-Flight Audit Record

This document satisfies **Plan0 §0** (pre-flight checks). Automated checks were run in CI/workspace; **manual device checks** should still be performed before a production release.

## Automated / workspace verification

| # | Check | Result | Notes |
|---|--------|--------|-------|
| 1 | `npm install` (frontend) | Pass | — |
| 2 | `npm run build` | Pass | TypeScript + Vite production build; route-level `React.lazy` — largest chunk ~306 kB (Recharts); entry ~274 kB gz ~88 kB |
| 3 | `npm run lint` | Pass | ESLint clean |
| 4 | PWA manifest generated | Pass | `vite-plugin-pwa`; see `dist/manifest.webmanifest` after build |
| 5 | Console errors (build) | Pass | No TS errors; runtime requires manual smoke test |

## Manual checklist (human)

Complete these in a browser (see Plan0 §17).

| # | Page / area | Issue type | What to verify | Priority |
|---|----------------|------------|----------------|----------|
| 1 | All | Layout | Resize 320px → 1920px: no horizontal overflow on primary flows | P1 |
| 2 | Application | PWA | Manifest validates in DevTools; theme/background colors | P1 |
| 3 | Application | PWA | Service worker registers; offline opens cached shell | P1 |
| 4 | Mobile | UX | Bottom nav: six routes tappable; sidebar hidden &lt;768px | P1 |
| 5 | iOS Safari | PWA | Add to Home Screen; status bar / safe-area; no double top inset | P1 |
| 6 | Dashboard | Perf | Charts render; optional Lighthouse Performance ≥85 mobile | P2 |
| 7 | Reports | Print | Export PDF / print layout hides chrome (`.no-print`) | P2 |
| 8 | Journal | UX | Add trade modal, filters, delete drawer | P2 |

## Static review notes (layout / UX)

| # | Page | Issue type | Description | Priority |
|---|------|------------|-------------|----------|
| 1 | Global | Perf | Entry bundle split via lazy-loaded routes + shared vendor chunks; further gains possible by lazy-loading heavy charts per page | P3 |
| 2 | MobileNav | UX | Notebook and Settings are not in bottom nav (by Plan0 design); reach via sidebar on tablet+ only | P3 |
| 3 | Landing | PWA | Marketing route separate from app shell; no service worker gap expected if same origin | P3 |

## Issues table (initial — template)

| # | Page | Issue type | Description | Priority |
|---|------|------------|-------------|----------|
| — | — | — | Populate during manual QA passes | — |

---

*Last updated: Plan0 completion pass — lazy routes (`App.tsx` + `Layout` Suspense), `RouteFallback`, mobile nav `aria-*`, main + Phase 1.1 merged.*
