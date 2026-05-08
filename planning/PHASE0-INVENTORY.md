# Phase 0 / “Plan 0” — Complete Inventory

> **Single source of truth** for everything shipped under project setup (EXECUTION-PLAN **Phase 0**) and the optional **Plan0 UI/PWA** track. Read this when onboarding or when someone asks “what did Plan 0 include?”

---

## 1. Clarify the naming (three different things)

| Name | What it is | Where |
|------|------------|--------|
| **Phase 0** | Roadmap slices **0.1–0.5** in `planning/EXECUTION-PLAN.md` — Company OS, Tradex preset, architecture/workflow skills, alignment with `NEXT_STEPS.md` | Checkboxes in EXECUTION-PLAN |
| **`planning/Plan0.md`** | Long-form **agent prompt** for pixel-perfect UI, PWA polish, responsive behavior (not a checkbox list) | ~1500 lines; referenced from `workflows.md` |
| **Plan0 implementation** | Actual **frontend code** that executes that prompt (modals, mobile nav, PWA config, etc.) | Commits `4a078ca`, `5e78eb4`; merged into branch `cursor/phase0-architecture-docs-07ef` |

Calling all three “Plan 0” without distinguishing them is why progress looked scattered.

---

## 2. Phase 0 slices (0.1–0.5) — what shipped

| Slice | Requirement | Delivered |
|-------|-------------|-----------|
| **0.1** | Initialize Claude Company OS | **`c4ea5de`** — Full `.claude/skills/**`, `workflow-101.md`, `docs/how-to-add-skills.md`, team skills, `scripts/setup.sh`, `scripts/company_os_apply.py`, `scripts/presets/tradex.env`, initial `planning/*` |
| **0.2** | Tradex details in `company.md` | **`tradex.env` preset** + applied `company.md` content via Company OS integration (**same merge as 0.1**) |
| **0.3** | Architecture skill with data model + API map | **`ff873e6`** — `.claude/skills/project/architecture.md` rewritten for Tradex (FastAPI routes, compose, `Trade` model, Phase 1 debt) |
| **0.4** | Tune workflows | **`ff873e6`** — `.claude/skills/project/workflows.md`: Phase 0 step linking to `Plan0.md`; renumbered feature checklist |
| **0.5** | Align execution plan with `NEXT_STEPS.md` | **`planning/EXECUTION-PLAN.md`** phases mirror product phases in `NEXT_STEPS.md` |

---

## 3. Related foundation (often grouped with “setup” but not Phase 0 slices)

| Item | Commit(s) / PR | Notes |
|------|----------------|------|
| Initial Tradex platform | `44c78d0`, `46c5da4` | Full-stack app import + rename ProJournX → Tradex |
| GitHub Pages + root PWA demo | `696153a`, merge **PR #1** | Separate mini Vite app at repo root (marketing/demo); distinct from `frontend/` |
| Company OS merge | **PR #4**, `c4ea5de` | Claude skills + Tradex preset |
| Bytecode gitignore | `7669dcd` | `.gitignore` |
| GCode harness | **PR #5**, `b2bbe38` | `.gcode/skills/tradex.md`, `scripts/setup-gcode.sh`, `AGENTS.md` |
| Plan0 **prompt file** on `main` | `7b367b5`, `520559b` | Adds **`planning/Plan0.md`**; commit message on `7b367b5` is **wrong** (says “Hello/Goodbye” — ignore; file is the UI prompt) |

---

## 4. Plan0 **implementation** (frontend + audit)

These commits existed on **`origin/cursor/plan0-pixel-perfect-ui-66d8`** and are **merged into** **`cursor/phase0-architecture-docs-07ef`** so one branch carries **docs + UI**.

| Commit | Summary |
|--------|---------|
| **`4a078ca`** | PWA meta/manifest/workbox, mobile bottom nav, `Toast`, `ErrorBoundary`, journal/playbooks/notebook modals and flows, calculator/reports/prop firm polish, chart/tooltip fixes, `vite.config.ts` |
| **`5e78eb4`** | `AppShellSkeleton`, font-ready boot overlay, `#root` background flash fix, Landing safe-area, **`planning/Plan0-AUDIT.md`** |

**Manual QA still recommended:** Lighthouse / devices per `planning/Plan0-AUDIT.md`.

---

## 5. Git quick reference

```text
main @ 520559b … Plan0.md prompt + rename only (no UI implementation until merged PR)

cursor/phase0-architecture-docs-07ef … Phase 0 skills + merged Plan0 UI (4a078ca, 5e78eb4) + docs commits (ff873e6, 3bb808f)
```

---

## 6. Improvements (recommended)

1. **Merge one consolidated PR** from `cursor/phase0-architecture-docs-07ef` → `main` so `main` contains both Phase 0 skills **and** Plan0 UI — otherwise “Plan 0” looks half-done on `main`.
2. **Rename or cross-link `Plan0.md`** — e.g. add at top: “This file is the UI/PWA prompt; Phase 0 checklist is `EXECUTION-PLAN.md`.” Optionally rename to `PLAN0-UI-PROMPT.md` in a follow-up commit (update `workflows.md` links).
3. **Commit messages** — Never ship placeholder messages like `7b367b5`; use Conventional Commits (`feat(planning): add Plan0 UI agent prompt`).
4. **CHANGELOG discipline** — One entry per merge slice; keep SHAs filled when known (`planning/CHANGELOG.md`).
5. **`AGENTS.md`** — Align React version with `frontend/package.json` (React 19).
6. **Chunk size** — Vite warns JS bundle >500 kB; optional Phase 2+ task: route-based code splitting.
7. **Branch hygiene** — After merge, delete stale branches (`cursor/plan0-pixel-perfect-ui-66d8`) or keep only if long-running.

---

## 7. Where to go next

- Product roadmap: **`NEXT_STEPS.md`** Phase **1** — JWT, PostgreSQL, auth UI (**slices 1.1–1.3** in `EXECUTION-PLAN.md`).
- Active queue: **`planning/ACTIVE.md`** (`NEXT UP: 1.1`).
