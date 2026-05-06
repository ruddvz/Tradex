---
name: handoff-protocol
description: >
  Standard format for passing work between agents AND between sessions. Load when
  finishing a task that another agent will continue, when picking up work started
  by another agent, or at the end of every work session. This is the contract
  that prevents "what was I doing?" at session start and prevents agents from
  producing outputs the next one cannot use.
---

# Handoff Protocol

Two types of handoffs in this OS:
1. **Session handoff** — written to `planning/CHANGELOG.md` after every commit
2. **Agent-to-agent handoff** — written to `memory/context-log.md` between agents in a pipeline

Both answer the same four questions:
1. **What was done?** — What the sending agent completed
2. **What exists now?** — Files, data, state left behind
3. **What needs doing next?** — The specific next task
4. **What must the next agent know?** — Decisions made, constraints, gotchas

---

## Part 1: Session Handoff (CHANGELOG.md)

**Write this after EVERY commit. No exceptions.**

```markdown
## YYYY-MM-DD HH:MM [TZ] — [branch-name] — [slice id]: [short title]
- Commit: <sha> (type: subject)
- Files touched: path1, path2, path3
- Tests added/changed: count (filename)
- Build: pass | fail (reason)
- Status: done | wip | blocked (reason if not done)
- Next up: [slice id + short title] OR [explicit question for next agent]
- Notes: [gotchas, partial state, deferred decisions — anything non-obvious]
```

**Rules for CHANGELOG entries:**
1. **Newest entry on top** — newest first, always
2. **`Next up:` is mandatory** — name a specific slice id or ask a specific question. Never leave empty.
3. **One entry per commit** — don't batch multiple commits into one entry
4. **Status: wip** when handing off unfinished work — include exact resume point
5. **No amend loops** — write `- Commit: (see git log)` if you don't have the SHA yet; do not `git commit --amend` repeatedly to fix it

**When context budget is tight (~20% remaining):**
STOP work → commit WIP → push → write CHANGELOG entry with `Status: wip` + explicit `Next up:`.
Do not try to cram one more slice at low budget. The handoff quality matters more than extra work.

---

## Part 2: Agent-to-Agent Handoff (context-log.md)

When handing off between agents in a pipeline, write this to `memory/context-log.md`:

```markdown
---
## HANDOFF: [TASK NAME]
**From:** [Agent name / role]
**To:** [Next agent name / role]
**Date:** YYYY-MM-DD HH:MM
**Status:** READY | READY_WITH_NOTES | BLOCKED | PARTIAL | NEEDS_REVIEW

### What I completed
- [Specific bullet — file names, function names, endpoints created]
- [Be specific, not "did the backend work"]

### What exists now
Files created or modified:
- `path/to/file.ts` — [what it contains / does]

State changes:
- [e.g. "Migration 20240115_add_orders_table.sql has been run on staging"]
- [e.g. "ENV var ORDER_SERVICE_URL added to .env.example"]

### Your next task
[One clear sentence stating exactly what the next agent needs to do]

### What you need to know
- [Decision made and why it affects you]
- [Gotcha or constraint you must respect]
- [Anything NOT done that you might assume is done]

### Definition of done
The next agent is finished when:
- [ ] [Specific verifiable condition 1]
- [ ] [Specific verifiable condition 2]
---
```

---

## Domain-Specific Handoff Rules

### Backend → Frontend
The backend agent MUST provide:
- Full API endpoint list: method, path, request body shape, response shape
- Auth requirements per endpoint (public / requires session / requires role)
- Error codes the frontend should handle

```markdown
### API Contract
**Endpoint:** POST /api/orders
**Auth:** Requires session
**Request body:** { "items": [...], "addressId": string }
**Success (201):** { "data": { "orderId": string }, "error": null }
**Errors:** 400 VALIDATION_ERROR | 403 FORBIDDEN | 422 INSUFFICIENT_STOCK
```

### Frontend → Backend
The frontend agent MUST provide:
- What data shape the UI expects from the API
- What user actions trigger which API calls
- Client-side validation already done (so backend knows what to trust)

### Backend → Ops
The backend agent MUST provide:
- New environment variables added (names only, not values)
- New services or dependencies added
- Database migrations that must run before deploy

### Any agent → Comms/Docs
The sending agent MUST provide:
- What changed, in plain language
- Audience (internal team / end users / external stakeholders)
- Tone needed (technical / non-technical / marketing)

---

## Receiving a Handoff

Before starting work on a received handoff:

1. Read the full handoff document
2. Verify the "What exists now" section matches reality
3. If anything is missing or wrong — stop and flag it before starting
4. Confirm in one sentence: "I'm picking up from [HANDOFF NAME] and my task is [NEXT TASK]."

Do not assume. Do not fill gaps silently. If the handoff is incomplete, say so.

---

## Handoff Status Codes

| Status | Meaning |
|---|---|
| `READY` | Complete, next agent can start immediately |
| `READY_WITH_NOTES` | Complete, but next agent should read the notes carefully |
| `BLOCKED` | Cannot hand off — describe what is blocking |
| `PARTIAL` | Some parts done, some not — list exactly what is and isn't done |
| `NEEDS_REVIEW` | Done but output should be reviewed by human before next agent starts |

---

## Failed Handoff Protocol

If you receive a handoff and cannot proceed:

```markdown
## HANDOFF REJECTED: [TASK NAME]
**Received from:** [Agent name]
**Rejected by:** [Your agent name]
**Reason:** [Exactly what is missing or wrong]
**What I need to proceed:** [Specific list]
```

Send this back to the orchestrator. Do not try to fill the gaps yourself.
