# Active Task Queue

> This file is the live queue. Every agent reads this at startup.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## 👉 NEXT UP: **Phase F** — Strategy runner in paper mode (or **6.x** live page polish)

See `TRADEX_AGENT_IMPLEMENTATION_AUDIT.md` Phase F and `planning/EXECUTION-PLAN.md`.

**Context:** `backend/app/services/strategy_runner.py` (new), `frontend` strategy events UI  
**Blocked by:** nothing (Phase E backtest MVP shipped on `cursor/audit-phase-e-settings-live-b0b9`)

---

## 🎯 Current Sprint / Phase

**Phase:** Audit track — **E** backtesting MVP ✓ · live playbooks + risk settings ✓ · **B/D** on PR #24  
**Branch:** `cursor/audit-phase-e-settings-live-b0b9`

### Open Slices
- [ ] **F** — StrategyRun model + paper-only runner + UI events
- [ ] **5** — PWA manifest / SW / mobile nav polish (see `NEXT_STEPS.md` Phase 5)
- [ ] **6.2** — Remaining mock surfaces (Calculator, some Reports widgets)

### Recently Done
- [x] **E** — Backtest models/API + Backtests page + trust warnings
- [x] **Risk settings** — `PATCH /risk/profiles/{id}` + Settings editor
- [x] **Live playbooks** — `derivePlaybooksFromTrades` in `hydrateLiveSession`
- [x] **8.2** + **B** + **D** — paper execution, live charts, risk engine (PR #23/#24 stack)
- [x] **8.1** — Paper accounts API + Paper Trading page

---

## Known Issues / Bugs

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| 1 | Data / API | API requires `Authorization: Bearer` for data routes | P1 | By design |
| 2 | Backtest | Uses **synthetic** OHLC only — not historical broker data | P2 | Documented |
| 3 | Product | Strategy runner + live execution still not built | P2 | Open |

---

## Blockers

| Blocker | Waiting for | Owner |
|---------|-------------|-------|
| — | — | — |

---

## Notes for Next Agent

- Read `planning/CHANGELOG.md` (newest entry) first
- Merge order: #23 → #24 → new PR for Phase E branch
- Audit doc: `TRADEX_AGENT_IMPLEMENTATION_AUDIT.md`
