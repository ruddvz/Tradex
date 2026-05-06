# Active Task Queue

> This file is the live queue. Every agent reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## 👉 NEXT UP: **[1.1]** — Phase 1: Authentication and PostgreSQL

Implement `NEXT_STEPS.md` Phase 1: JWT auth (`/api/v1/auth/*`), SQLAlchemy models + `get_db`, protect routes, and add `frontend/src/pages/Auth.tsx` with token storage.

**Context:** `NEXT_STEPS.md` Phase 1, `backend/app/api/v1/routes.py`, `frontend/src/App.tsx`
**Blocked by:** nothing

---

## 🎯 Current Sprint / Phase

**Phase:** Phase 1 — Auth and persistent data
**Goal:** Multi-user app with PostgreSQL-backed trades and login/signup UI
**Target:** Complete Phase 1 checkboxes in NEXT_STEPS.md

### Open Slices
- [ ] **1.1** Backend auth + User model + protected routes
- [ ] **1.2** Wire trades/notebook/challenges to DB
- [ ] **1.3** Auth UI + App routing guard + logout in Settings

### In Progress
- [ ] **0.2** Company OS configured for Tradex (skills + planning)

### Recently Done
- [x] **0.1** Claude Company OS files imported from archive

---

## Known Issues / Bugs

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| 1 | Data | API still mock/in-memory until Phase 1 DB work | P1 | Open |

---

## Blockers

| Blocker | Waiting for | Owner |
|---------|-------------|-------|
| — | — | — |

---

## Completed This Session

- [x] Company OS integrated; Tradex preset applied via `scripts/setup.sh --preset tradex`

---

## Phase History (compact)

- **Setup** (see CHANGELOG): Claude Company OS + Tradex preset ✓

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
- Product roadmap: **`NEXT_STEPS.md`** (authoritative phases)
- Company context: `.claude/skills/core/company.md`
