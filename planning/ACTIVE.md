# Active Task Queue

> This file is the live queue. Every agent reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## 👉 NEXT UP: **[3]** — MT5 sync (real)

Wire Sidebar/Header sync to `POST /api/v1/sync/mt5`, persist credentials from Settings per `NEXT_STEPS.md` Phase 3.

**Context:** `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/pages/Settings.tsx`, `backend/app/api/v1/routes.py`  
**Blocked by:** nothing

---

## 🎯 Current Sprint / Phase

**Phase:** Phase 3 — MT5 integration (next)  
**Previous:** Phase 2 — trade screenshots ✓

### Open Slices
- [ ] **3** — MT5 sync UI + optional credential storage (see `NEXT_STEPS.md` Phase 3)

### Recently Done
- [x] **2.1–2.2** Trade screenshots — `POST /trades/{id}/screenshot`, static `/uploads`, `screenshot_before_url` / `screenshot_after_url`, Journal before/after zones, API trade fetch when logged in
- [x] **1.3** Auth UI (`/auth`), `ProtectedLayout`, `tradex_access_token`, Settings **Sign out**, Vite dev proxy `/api` → backend
- [x] **1.2** PostgreSQL persistence for trades, notebook entries, prop challenges
- [x] **1.1** JWT auth + Bearer protection
- [x] **0.1–0.4** Company OS + Plan0 documentation track

---

## Known Issues / Bugs

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| 1 | Data / API | API requires `Authorization: Bearer` for data routes | P1 | By design |
| 2 | Frontend | **Dashboard** (and most pages) still use **`mockData.ts`** — Journal loads live trades when authenticated; broader API wiring is future work | P2 | Open |

---

## Blockers

| Blocker | Waiting for | Owner |
|---------|-------------|-------|
| — | — | — |

---

## Completed This Session

- [x] Phase 2 closed: **2.1–2.2** screenshot upload + Journal UI + `/uploads` proxy
- [x] Phase 1 closed: **1.1** JWT, **1.2** DB persistence, **1.3** Auth UI + guard + logout
- [x] **`planning/COMMITS-ON-MAIN.md`** — explains fast-forward vs visible PR diffs

---

## Phase History (compact)

- **Phase 2** — Trade screenshots ✓
- **Phase 1** — Auth + PostgreSQL + Auth UI ✓
- **Phase 0** — see **`planning/PHASE0-INVENTORY.md`**

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
- **Phase 0 / Plan0:** `planning/PHASE0-INVENTORY.md`
- **Git / PRs:** `planning/COMMITS-ON-MAIN.md` if PR view looks empty
- Product roadmap: **`NEXT_STEPS.md`**
- Company context: `.claude/skills/core/company.md`
