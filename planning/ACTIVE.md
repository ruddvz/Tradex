# Active Task Queue

> This file is the live queue. Every agent reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## 👉 NEXT UP: **[2.1]** — Trade screenshot upload (backend)

Add `POST /api/v1/trades/{id}/screenshot` with multipart file save under `uploads/` and `Trade.screenshot_url` per `NEXT_STEPS.md` Phase 2.

**Context:** `backend/app/api/v1/routes.py`, `EXECUTION-PLAN` Phase 2  
**Blocked by:** nothing

---

## 🎯 Current Sprint / Phase

**Phase:** Phase 2 — Trade screenshots (next)  
**Previous phase:** Phase 1 — **complete** (slices 1.1–1.3)

### Open Slices
- [ ] **2.1** Backend multipart upload + storage path
- [ ] **2.2** Journal `TradeDrawer` before/after upload UI

### Recently Done
- [x] **1.3** Auth UI (`/auth`), `ProtectedLayout`, `tradex_access_token`, Settings **Sign out**, Vite dev proxy `/api` → backend
- [x] **1.2** PostgreSQL persistence for trades, notebook entries, prop challenges
- [x] **1.1** JWT auth + Bearer protection
- [x] **0.1–0.4** Company OS + Plan0 documentation track

---

## Known Issues / Bugs

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| 1 | Data / API | API requires `Authorization: Bearer` for data routes | P1 | By design |
| 2 | Frontend | Dashboard/journal still read **`mockData.ts`** — wire `fetch` + Bearer to live trades list (after screenshot slice or dedicated wiring task) | P2 | Open |

---

## Blockers

| Blocker | Waiting for | Owner |
|---------|-------------|-------|
| — | — | — |

---

## Completed This Session

- [x] Phase 1 closed: **1.1** JWT, **1.2** DB persistence, **1.3** Auth UI + guard + logout
- [x] **`planning/COMMITS-ON-MAIN.md`** — explains fast-forward vs visible PR diffs

---

## Phase History (compact)

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
