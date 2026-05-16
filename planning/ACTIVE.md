# Active Task Queue

> This file is the live queue. Every agent reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## 👉 NEXT UP: **[6.3]** — Setup health API + Action Center card

Add **`GET /api/v1/setup/health`** (DB, Redis, optional OpenAI/MT5 flags) and surface a compact health strip on Action Center. Optionally auto-open tasks for missing items.

**Context:** `backend/app/api/v1/`, `frontend/src/pages/ActionCenter.tsx`  
**Blocked by:** nothing

---

## 🎯 Current Sprint / Phase

**Phase:** Phase 6 — Action Center (in progress) · Phase 5 PWA still open  
**Previous:** Phase **4** — Daily email + Celery ✓

### Open Slices
- [ ] **5** — PWA manifest / SW / mobile nav (see `NEXT_STEPS.md` Phase 5)
- [ ] **6.3** — Setup health endpoint + UI card (`planning/TRADEX-SETUP-AND-ACTION-CENTER-PLAN.md`)

### Recently Done
- [x] **6.1–6.2** Action Center — `manual_tasks` API, register seed, Action Center page + nav (`planning/CHANGELOG.md`)
- [x] **4** — Email service + Celery beat + notification prefs API + Settings wiring (`planning/CHANGELOG.md`)
- [x] **3.1–3.2** MT5 sync merged — JSON `POST /sync/mt5`, `GET`/`PUT /settings/mt5`, Fernet password storage, `Mt5SyncModal`, Settings MT5 form, `refreshTradesFromApi`
- [x] **2.1–2.2** Trade screenshots — upload endpoint, Journal UI, `/uploads`
- [x] **1.3** Auth UI (`/auth`), `ProtectedLayout`, Settings **Sign out**
- [x] **1.2** PostgreSQL persistence for trades, notebook, prop challenges
- [x] **1.1** JWT auth + Bearer protection
- [x] **0.1–0.5** Company OS + Plan0 documentation track

---

## Known Issues / Bugs

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| 1 | Data / API | API requires `Authorization: Bearer` for data routes | P1 | By design |
| 2 | Frontend | **Dashboard** (and most pages) still use **`mockData.ts`** — Journal loads live trades when authenticated; broader API wiring is future work | **P0** (see Phase 6) | Open |
| 3 | Product | **Setup health** (`GET /setup/health`) not built yet | P2 | Open |

---

## Blockers

| Blocker | Waiting for | Owner |
|---------|-------------|-------|
| — | — | — |

---

## Completed This Session

- [x] **Merged to `main`:** `cursor/phase2-trade-screenshots-07ef` then `cursor/phase3-mt5-sync-07ef` (merge commit resolves MT5 + PostgreSQL sync path)
- [x] Phase 3 closed: **3.1–3.2** MT5 settings API + UI
- [x] Phase 2 closed: **2.1–2.2** screenshots + Journal + `/uploads`
- [x] Phase 1 closed: **1.1–1.3** JWT, DB persistence, Auth UI
- [x] **`planning/COMMITS-ON-MAIN.md`** — explains fast-forward vs visible PR diffs

---

## Phase History (compact)

- **Phase 3** — MT5 sync ✓
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
