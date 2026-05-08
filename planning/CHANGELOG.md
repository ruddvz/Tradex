# CHANGELOG

> **Session-handoff log.** Every agent MUST append an entry after every commit
> so the next agent (or human) can pick up instantly without re-deriving state.
>
> **Read this file at session start** (alongside `planning/ACTIVE.md` and
> `planning/EXECUTION-PLAN.md`). The most recent entry is the starting point.

---

## Entry Format (copy / paste this block)

```
## <YYYY-MM-DD HH:MM TZ> — <branch> — <slice id>: <short title>
- Commit: <short-sha> (<type>: <subject>)
- Files touched: <path1>, <path2>, ...
- Tests added / changed: <count> (<file>)
- Build: pass | fail (<reason>)
- Status: done | wip | blocked (<reason>)
- Next up: <slice id + short title> OR <explicit question for the next agent>
- Notes: <anything non-obvious — gotchas, partial state, deferred decisions>
```

## Rules every agent must follow

1. **Read at session start:** This file (latest entry), `planning/ACTIVE.md` (NEXT UP line), `planning/EXECUTION-PLAN.md` (phase checkbox state).
2. **Append an entry after every commit.** One entry per commit, newest on top. Never rewrite history.
3. **Commit every logical slice.** Don't accumulate uncommitted work — a slice = a commit = a CHANGELOG entry.
4. **Low-token handoff protocol.** When context budget is tight (~20% remaining), STOP work, commit WIP, push, and write a CHANGELOG entry with `Status: wip` and an explicit `Next up:`. Do not try to cram one more slice.
5. **`Next up:` is mandatory.** The pointer must name a slice id from `EXECUTION-PLAN.md` or a direct question for the human. Never leave it empty.
6. **No CHANGELOG ↔ amend loops.** Never `git commit --amend` solely to fix the `Commit:` line. Use `- Commit: (see git log)` for docs-only commits.

---

## Log (newest first)

## 2026-05-08 — cursor/plan0-pixel-perfect-ui-66d8 — Plan0 completion: boot skeleton, audit doc, safe-area polish
- Commit: (see git log)
- Files touched: `frontend/src/components/layout/{Layout,AppShellSkeleton}.tsx`, `frontend/src/components/layout/Header.tsx`, `frontend/src/index.css`, `frontend/src/pages/Landing.tsx`, `planning/Plan0-AUDIT.md`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: manual Lighthouse / device QA per `planning/Plan0-AUDIT.md`; or Phase **1.1** backend auth per `planning/ACTIVE.md`
- Notes: Boot overlay uses `document.fonts.ready` + min 280ms; `#root` bg prevents flash; Header uses `.header-safe`; Landing nav/hero respect safe-area.

## 2026-05-08 — cursor/plan0-pixel-perfect-ui-66d8 — Plan0: pixel-perfect PWA UI + interactions
- Commit: (see git log)
- Files touched: `frontend/index.html`, `frontend/vite.config.ts`, `frontend/src/index.css`, `frontend/src/App.tsx`, `frontend/src/store/useStore.ts`, `frontend/src/components/layout/*`, `frontend/src/components/ui/{Toast,Skeleton}.tsx`, `frontend/src/components/journal/AddTradeModal.tsx`, `frontend/src/components/playbooks/CreatePlaybookModal.tsx`, `frontend/src/components/notebook/NoteEditor.tsx`, `frontend/src/components/ErrorBoundary.tsx`, `frontend/src/hooks/useBreakpoint.ts`, `frontend/src/pages/*`, chart tooltip typings
- Tests added / changed: 0 (manual verification via build + lint)
- Build: pass (`npm run build`, `npm run lint`)
- Status: done
- Next up: Phase **1.1** from `planning/ACTIVE.md` — JWT auth + User model if continuing backend roadmap
- Notes: Implements `planning/Plan0.md`: mobile bottom nav, PWA meta/manifest/workbox, safe-area/header offset (`page-shell`), journal/playbooks/notebook modals, toasts, calculator RR meter, reports print export, PropFirm drawdown pulse + live days.

- Commit: (see git log)
- Files touched: `.claude/`, `planning/`, `scripts/setup.sh`, `scripts/company_os_apply.py`, `scripts/presets/tradex.env`
- Tests added / changed: 0
- Build: pass (docs/skills only)
- Status: done
- Next up: **1.1** — JWT auth + User model per NEXT_STEPS.md Phase 1
- Notes: Company OS applied from zip; use `bash scripts/setup.sh --preset tradex` to re-apply after template resets.


## 2026-05-06 — main — project-setup: initial Claude Company OS configuration
- Commit: (see git log)
- Files touched: `planning/ACTIVE.md`, `planning/EXECUTION-PLAN.md`, `.claude/skills/core/company.md`
- Tests added / changed: 0
- Build: pass
- Status: done
- Next up: Fill in `skills/core/company.md` with your company details, then start first slice
- Notes: Template initialized. All [PLACEHOLDER] values need to be filled in before first use.
