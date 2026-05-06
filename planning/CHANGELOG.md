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

## 2026-05-06 — main — company-os: Tradex preset + automated setup
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
