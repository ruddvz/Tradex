# Execution Plan

> Phase-based roadmap. Check off slices as you ship them.
> Agents reference this file to find their current slice id.
> Format: `[ ]` pending · `[x]` done · `[~]` partial/blocked

---

## How to Use This File

1. **At session start:** Scan for the current unchecked slice in the active phase
2. **After shipping:** Mark the slice `[x]`
3. **When blocked:** Mark `[~]` and add a note explaining the block
4. **Adding work:** Add new slices at the bottom of the relevant phase
5. **Slice ids:** Use format `Phase.Slice` (e.g. `1.1`, `2.3`)

---

## Phase 0 — Project Setup

> Delivered-work manifest (slices + Plan0 prompt + Plan0 UI): **`planning/PHASE0-INVENTORY.md`**

- [x] **0.1** Initialize Claude Company OS
- [x] **0.2** Fill in `skills/core/company.md` with Tradex details (preset)
- [x] **0.3** Fill in `skills/project/architecture.md` with Tradex data model and API map
- [x] **0.4** Tune `skills/project/workflows.md` further if new commands are added
- [x] **0.5** Align execution plan with `NEXT_STEPS.md` (this file)

---

## Phase 1 — Auth and real database

> **Goal:** Multi-user Tradex with PostgreSQL. See `NEXT_STEPS.md` Phase 1.

- [x] **1.1** JWT auth endpoints + `User` model + `get_current_user`
- [x] **1.2** Replace in-memory stores with SQLAlchemy queries
- [x] **1.3** Login/signup UI + `App.tsx` guard + Settings logout

---

## Phase 2 — Trade screenshots

> **Goal:** `POST /api/v1/trades/{id}/screenshot` + Journal drawer uploads. See NEXT_STEPS Phase 2.

- [ ] **2.1** Backend multipart upload + storage path
- [ ] **2.2** Journal `TradeDrawer` before/after upload UI

---

## Phase 3 — MT5 sync (real)

> **Goal:** Sidebar sync calls backend; Settings stores credentials. See NEXT_STEPS Phase 3.

---

## Phase 4 — Daily email reports

> **Goal:** Celery + email service + Settings toggle. See NEXT_STEPS Phase 4.

---

## Phase 5 — PWA and mobile nav

> **Goal:** manifest, service worker, bottom nav. See NEXT_STEPS Phase 5.

---

## Done (Summary)

| Phase | Slices | Shipped | Date |
|-------|--------|---------|------|
| Phase 0 | 5 | 5 | see CHANGELOG |

---

## Notes

- Slice ids are referenced in `planning/CHANGELOG.md` entries — keep them stable
- Product-level detail lives in **`NEXT_STEPS.md`**; keep this file in sync when phases shift
- **`planning/PHASE0-INVENTORY.md`** — canonical inventory for Phase 0 and Plan0-related work (commits, branches, improvements)
- **`planning/Plan0.md`** — optional pixel-perfect UI/PWA playbook (frontend polish); not a substitute for roadmap slices
