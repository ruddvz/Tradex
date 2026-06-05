# Tradex — Next Steps for Agent

> **Start here:** `planning/CURRENT-STATE-AND-NEXT-WORK.md` (canonical truth)  
> **Active queue:** `planning/ACTIVE.md`  
> **Phase checkboxes:** `planning/EXECUTION-PLAN.md`

Phases **0–15** are **complete** on `main`. Do not re-implement email, PWA, paper MVP, or backtest MVP unless you find a regression.

---

## Current focus: P1 backlog (post-audit)

Pick **one slice** per session from `planning/CURRENT-STATE-AND-NEXT-WORK.md` § Next work:

1. **Import batches** — transparency for MT5/sync imports (`import_batches` table + Settings UI)
2. **CSV historical candles** — real backtest data adapter (replace synthetic-only path)
3. **Strategy versioning** — immutable snapshots for backtest/paper runs
4. **Metrics parity** — backend fixtures as source of truth for Reports
5. **Walk-forward / OOS** — overfit warnings on backtest results

---

## Verification (run before every PR)

```bash
./scripts/verify.sh
```

Expected: backend pytest green, frontend lint + build, service worker present, Playwright e2e (3 tests).

---

## Non-negotiable product rules

- TradeX is **not** a live money bot — `DisabledLiveBroker` must stay enforced
- Demo / synthetic / paper / journal data must stay **labelled** (`DataModeBadge`)
- AI coach = **behavioral review only** — no buy/sell signals
- MT5 demo fallback only when `DEBUG=true` **and** `ALLOW_DEMO_MT5_FALLBACK=true`
- Do not claim “production-ready” until P2 security gates pass

---

## Data mode matrix

See `planning/CURRENT-STATE-AND-NEXT-WORK.md` for the full table. Every major page must respect mode separation.

---

## Historical phases (complete — reference only)

<details>
<summary>Phases 1–5 (original roadmap)</summary>

### Phase 1 — Authentication & Real Database ✓
JWT auth, PostgreSQL, login/signup UI.

### Phase 2 — Trade Screenshot Upload ✓
Multipart upload + Journal drawer.

### Phase 3 — Real MT5 Sync ✓
Sync modal, encrypted credentials, duplicate detection.

### Phase 4 — Daily Email Report ✓
email_service, Celery beat, settings toggle.

### Phase 5 — PWA and Mobile Nav ✓
Manifest, service worker, bottom nav, safe-area.

</details>

<details>
<summary>Phases 6–15 (audit roadmap)</summary>

See `planning/EXECUTION-PLAN.md` — all slices marked `[x]`.

</details>

---

## Phase numbering map

| Legacy | Maps to |
|--------|---------|
| Phase 6 (Action Center) | Manual tasks + setup health |
| Phase 7 (Live dashboard) | hydrateFromApi, notebook API |
| Phase 8 (Paper sprint) | Paper accounts + orders |
| Phase E | Backtesting MVP + risk profile editor |

Do not duplicate work across these names — use `EXECUTION-PLAN.md` slice ids in CHANGELOG entries.
