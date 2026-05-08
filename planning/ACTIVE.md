# Active Task Queue

> This file is the live queue. Every agent reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## 👉 NEXT UP: **[1.2]** — Persist trades, notebook, and challenges in PostgreSQL

Replace in-memory `_trades`, `_notebook`, `_challenges` in `routes.py` with SQLAlchemy queries against `Trade`, `NotebookEntry`, and `PropChallenge` models. Wire `get_db` for all CRUD.

**Context:** `NEXT_STEPS.md` Phase 1 task 2, `backend/app/api/v1/routes.py`, `backend/app/models/trade.py`
**Blocked by:** nothing (requires running PostgreSQL + Alembic or `create_all` for new tables)

---

## 🎯 Current Sprint / Phase

**Phase:** Phase 1 — Auth and persistent data
**Goal:** Multi-user app with PostgreSQL-backed trades and login/signup UI
**Target:** Complete Phase 1 checkboxes in NEXT_STEPS.md

### Open Slices
- [ ] **1.2** Wire trades/notebook/challenges to DB
- [ ] **1.3** Auth UI + App routing guard + logout in Settings

### Recently Done
- [x] **1.1** JWT auth (`/auth/register`, `/auth/login`, `/auth/me`), `User` model + `users` table, `HTTPBearer` protection, per-user in-memory stores until 1.2
- [x] **0.1** Claude Company OS files imported from archive
- [x] **0.2** Company OS configured for Tradex (skills + planning)
- [x] **0.3** Architecture skill — Tradex data model + API map
- [x] **0.4** Workflows skill — pointer to `planning/Plan0.md` for UX polish

---

## Known Issues / Bugs

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| 1 | Data / API | Trades, notebook, and challenges are still in-memory (per `user_id`) until slice **1.2**; all data routes require `Authorization: Bearer` | P1 | Open |
| 2 | Frontend | Demo still uses `mockData.ts` — add **1.3** `Auth.tsx` and API wiring to use the token | P2 | Open |

---

## Blockers

| Blocker | Waiting for | Owner |
|---------|-------------|-------|
| — | — | — |

---

## Completed This Session

- [x] **Phase 0** merged to `main` (Plan0 UI + `PHASE0-INVENTORY`, skills)
- [x] **1.1** backend — JWT, `User` + `users` table, protected routes, user-scoped in-memory data

---

## Phase History (compact)

- **Phase 0:** Complete — see **`planning/PHASE0-INVENTORY.md`** (Company OS, skills, Plan0 prompt, Plan0 UI merge)
- Company OS + Tradex preset ✓ (`scripts/setup.sh --preset tradex`)

---

## Domain Audit Status

| Domain | Last Audited | Status | Open issues |
|--------|-------------|--------|-------------|
| frontend | never | not run | — |
| backend  | never | not run | — |
| ops      | never | not run | — |
| data     | never | not run | — |

---

## Notes for Next Agent

- Read `planning/CHANGELOG.md` (newest entry) first
- **Phase 0 / Plan0 full picture:** `planning/PHASE0-INVENTORY.md` (everything shipped and where it lives in git)
- Product roadmap: **`NEXT_STEPS.md`** (authoritative phases)
- Company context: `.claude/skills/core/company.md`
