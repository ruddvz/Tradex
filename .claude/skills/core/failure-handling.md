---
name: failure-handling
description: >
  Rules for what agents do when they get stuck, hit an error, produce wrong output,
  or encounter something outside their skill. Load this when a task is failing,
  when you are unsure how to proceed, when you have retried something more than
  once, or when output does not match what was expected. This skill prevents agents
  from silently failing, looping forever, or making things worse while trying to fix them.
---

# Failure Handling

When something goes wrong, the worst thing an agent can do is guess, loop, or
silently produce bad output. This skill defines exactly what to do instead.

---

## The Core Rule

**Three attempts, then escalate. No exceptions.**

```
Attempt 1: Retry with the exact same approach, more carefully
Attempt 2: Change the approach — try a different method
Attempt 3: Reduce scope — do the smallest possible version of the task
Attempt 4: STOP. Write a failure report. Escalate to the orchestrator or human.
```

Every attempt must be logged. Never retry silently.

---

## Failure Classification

Before responding to a failure, classify it:

### Type A — Input Problem
The task instructions were unclear, incomplete, or contradictory.
**Do:** Ask one specific clarifying question. Do not guess.

### Type B — Knowledge Gap
The task requires information the agent does not have (credentials, business
context, external system behavior).
**Do:** State exactly what information is missing. Do not proceed without it.

### Type C — Technical Failure
The code, query, or operation failed with an error.
**Do:** Read the error carefully. Check the relevant skill file for the correct
pattern. Fix the specific error. Do not rewrite the whole thing.

### Type D — Scope Creep
The task has grown beyond what was originally scoped.
**Do:** Stop. Report what the original scope was and what the actual scope now
appears to be. Get approval before expanding work.

### Type E — Conflict
The task conflicts with a rule in a skill file or a previous decision.
**Do:** Stop immediately. Report the conflict. Do not override skill rules to
complete a task.

---

## Failure Report Format

When escalating, always write this:

```markdown
## FAILURE REPORT
**Agent:** [Your role]
**Task:** [What you were trying to do]
**Failure type:** [A / B / C / D / E — see classification above]
**Date:** [YYYY-MM-DD HH:MM]

### What I tried
1. [Attempt 1 — what you did and what happened]
2. [Attempt 2 — what you tried differently and what happened]
3. [Attempt 3 — what you tried and what happened]

### What the error / problem is
[Exact error message, or clear description of what went wrong]
[Include relevant file names, line numbers, or output]

### What I need to proceed
[Specific — not "more information" but exactly what information]
[e.g. "The Stripe webhook secret for staging" or "Confirmation that orders
can be deleted rather than soft-deleted"]

### What I have NOT touched
[Reassure the orchestrator/human that you did not make things worse]
[List any files or state that remain unchanged]

### Recommended next step
[Your best suggestion for how to unblock this]
```

---

## What Agents Never Do When Failing

These actions make failures worse and are strictly prohibited:

- **Never delete data** to resolve an error
- **Never disable tests** to make CI pass
- **Never comment out error handling** to make code run
- **Never hardcode values** as a temporary fix (there is no such thing)
- **Never make changes outside the task scope** while fixing a failure
- **Never proceed with a partial output** without flagging it as partial
- **Never retry the same failed approach** a fourth time
- **Never modify skill files** to make a task fit the skill

---

## Partial Completion Protocol

Sometimes an agent completes part of a task but not all of it. This is acceptable
as long as it is clearly communicated.

```markdown
## PARTIAL COMPLETION: [TASK NAME]
**Completed:**
- [What was finished — specific]

**Not completed:**
- [What remains — specific]
- [Why it was not completed]

**State of the system:**
[Is the partial work safe? Does it break anything? Can the next agent
safely build on it, or does it need to be rolled back first?]

**To complete this task:**
[Exact instructions for whoever picks this up next]
```

Write this to `memory/context-log.md` before stopping.

---

## Recovery Checklist

When picking up a failed or partial task:

- [ ] Read the failure report in `memory/context-log.md`
- [ ] Understand what was tried and why it failed
- [ ] Check that no partial changes left the system in a broken state
- [ ] Confirm you have what was listed in "What I need to proceed"
- [ ] Start from a clean known state — do not build on broken output
- [ ] Use a different approach than what failed (same approach will fail again)

---

## Escalation Path

```
Agent fails
    ↓
Write failure report
    ↓
Orchestrator reads report
    ↓
Orchestrator can resolve? → Yes → Orchestrator retries with different instructions
                          → No  → Escalate to human with failure report
                                    ↓
                               Human provides missing info or makes decision
                                    ↓
                               Orchestrator dispatches again with new context
```

The human only gets involved when the orchestrator cannot resolve it. The
orchestrator only escalates when the agent cannot resolve it. Each layer
tries once before passing up.

---

## Common Failures and Fixes

### "I don't know what file to edit"
Read `skills/project/architecture.md`. If still unclear, ask.

### "The tests are failing and I don't know why"
Read the test output literally. Do not guess. Find the exact assertion that
failed and trace back to the code that produces that value.

### "The API is returning an error"
Check: auth token present? Request body matches schema? Endpoint path correct?
Check network tab / server logs for the actual error, not just the status code.

### "I made a change and now something else broke"
Stop. Do not try to fix the new breakage. Revert your change first, then
understand why it caused the breakage before trying again.

### "The task is bigger than I thought"
Stop. Report the actual scope. Get approval. Do not quietly expand the work.

### "I'm not sure if I should do X or Y"
Do not guess on decisions. Write it as a question in the failure report.
Decisions belong to the human or the orchestrator, not the executing agent.
