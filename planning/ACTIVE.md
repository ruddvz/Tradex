# Active Task Queue

> This file is the live queue. Every agent reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## 👉 NEXT UP: **[1.3]** — Auth UI + App routing guard + logout

Add `frontend/src/pages/Auth.tsx`, JWT storage, `App.tsx` guard, Settings logout; wire API calls with `Authorization: Bearer` when replacing `mockData.ts`.

**Context:** `NEXT_STEPS.md` Phase 1 task 3  
**Blocked by:** nothing

---

## 🎯 Current Sprint / Phase

**Phase:** Phase 1 — Auth and persistent data
**Goal:** Multi-user app with PostgreSQL-backed trades and login/signup UI
**Target:** Complete Phase 1 checkboxes in NEXT_STEPS.md

### Open Slices
- [ ] **1.3** Auth UI + App routing guard + logout in Settings

### Recently Done
- [x] **1.2** PostgreSQL persistence for trades, notebook entries, prop challenges (`Trade`, `NotebookEntry`, `PropChallenge` + `routes.py` refactor)
- [x] **1.1** JWT auth (`/auth/register`, `/auth/login`, `/auth/me`), `User` model + `users` table, `HTTPBearer` protection
- [x] **0.1** Claude Company OS files imported from archive
- [x] **0.2** Company OS configured for Tradex (skills + planning)
- [x] **0.3** Architecture skill — Tradex data model + API map
- [x] **0.4** Workflows skill — pointer to `planning/Plan0.md` for UX polish

---

## Known Issues / Bugs

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| 1 | Data / API | Backend stores trades, notebook, challenges in PostgreSQL; API requires `Authorization: Bearer` | P1 | Mitigated (1.2) |
| 2 | Frontend | Demo still uses `mockData.ts` — **1.3** Auth UI + API wiring | P2 | Open |

---

## Blockers

| Blocker | Waiting for | Owner |
|---------|-------------|-------|
| — | — | — |

---

## Completed This Session

- [x] **Phase 0** merged to `main` (Plan0 UI + `PHASE0-INVENTORY`, skills)
- [x] **1.2** backend — SQLAlchemy persistence (trades, notebook, challenges)

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
- **Git / PRs:** if PR diff is empty, see **`planning/COMMITS-ON-MAIN.md`** (fast-forward merges land commits on `main` without a merge commit diff).
