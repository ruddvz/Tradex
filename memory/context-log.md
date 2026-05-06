# Context Log

> **Shared agent memory.** Agents write here when finishing work. The next agent
> reads this before starting. This prevents re-doing work, contradicting decisions,
> and "what was I doing?" moments at session start.
>
> **Format:** Newest entries on top. Use the HANDOFF template from
> `.claude/skills/core/handoff-protocol.md` for agent-to-agent handoffs.

---

## How to Use

**Reading:** Before starting any task, scan entries from newest → oldest until you find
context relevant to your work. Stop when you've found what you need.

**Writing:** After completing work, append an entry. Keep it factual and specific.
Vague entries ("did some stuff") help no one.

---

## Domain Audit Schedule

| Domain   | Last Audited | Next Due   | Status |
|----------|-------------|------------|--------|
| frontend | never       | now        | not run |
| backend  | never       | now        | not run |
| ops      | never       | now        | not run |
| data     | never       | now        | not run |

> Update this table after every audit. Orchestrator flags any domain not audited in 14 days.

---

## Session Log

---
## HANDOFF: Project Initialization
**From:** Setup
**To:** First agent
**Date:** [YYYY-MM-DD]
**Status:** READY

### What was completed
- Claude Company OS v2 initialized
- All template files placed in correct locations

### What exists now
Files created:
- `.claude/workflow-101.md` — master 8-phase workflow
- `.claude/skills/core/` — 8 core skill files
- `.claude/skills/team/` — 4 team skill files
- `.claude/skills/project/` — 3 project skill files
- `planning/CHANGELOG.md` — session handoff log (empty)
- `planning/ACTIVE.md` — task queue (template)
- `planning/EXECUTION-PLAN.md` — phase tracking (template)

### Your next task
Fill in all [PLACEHOLDER] values in `skills/core/company.md`, then fill in `skills/project/architecture.md` with your real system architecture.

### What you need to know
- All files contain [PLACEHOLDER] markers for company-specific content
- Start with `skills/core/company.md` — it's the foundation everything else reads
- Run `bash scripts/setup.sh` for guided setup of the most common placeholders
---
