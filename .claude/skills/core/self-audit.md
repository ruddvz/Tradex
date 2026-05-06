---
name: self-audit
description: >
  Department self-improvement protocol. Every domain agent (frontend, backend, ops,
  data) runs this audit on their own area when triggered. The agent scans its domain,
  finds what is broken or degraded, fixes P1/P2 issues immediately, and creates
  planned slices in EXECUTION-PLAN.md for P3 improvements. Load this whenever an
  agent is asked to "check your area", "audit your domain", or at the start of any
  maintenance session. Also triggered automatically by the orchestrator on a schedule.
---

# Self-Audit Protocol

Every agent owns a domain. Every domain drifts. This protocol keeps each department
honest — agents don't wait to be told something is broken, they find it themselves.

---

## When to Run

- **Triggered by orchestrator** — scheduled check (weekly or after a major feature ships)
- **Triggered by human** — "check the frontend", "audit the backend", "what needs fixing in ops"
- **Self-triggered** — any agent that notices something wrong outside their current task
- **Session start** — if ACTIVE.md shows no explicit next task, run a self-audit instead of guessing

---

## The 4-Step Audit Loop

```
1. SCAN    → Look at every file, test, config, and dependency in your domain
2. TRIAGE  → Classify every finding: P1 (broken) | P2 (degraded) | P3 (improvement)
3. ACT     → Fix P1 and P2 immediately. Plan P3 as slices in EXECUTION-PLAN.md.
4. REPORT  → Write findings + actions to planning/ACTIVE.md and memory/context-log.md
```

Never skip step 4. If there is no written report, the audit did not happen.

---

## Step 1: SCAN — What to Look For

Each domain has different scan targets. See your team skill file for domain-specific
checks. Universal checks every agent runs:

### Code Health
- [ ] Any file over 800 lines? → split by feature
- [ ] Any function over 50 lines? → extract helpers
- [ ] Any `// TODO` without a ticket number? → resolve or create ticket
- [ ] Any commented-out code? → delete it
- [ ] Any `console.log` or debug statements? → remove
- [ ] Any `@ts-ignore` or `any` type without a comment? → fix types
- [ ] Any hardcoded secrets, URLs, or IDs? → move to env vars

### Test Health
- [ ] Run the test suite — are any tests failing?
- [ ] Are there untested code paths in business logic? → write tests
- [ ] Are any tests skipped (`it.skip`, `xit`, `xtest`)? → fix or delete
- [ ] Is coverage below 80% in your domain? → add tests

### Dependency Health
- [ ] Any dependency with a known security vulnerability? → update immediately
- [ ] Any package that is unused? → remove
- [ ] Any package that is 2+ major versions behind? → plan upgrade

### Build / Lint Health
- [ ] Does `npm run build` pass with zero errors? → fix any errors
- [ ] Does `npm run lint` pass with zero warnings? → fix any warnings
- [ ] Are there any TypeScript errors? → fix all

---

## Step 2: TRIAGE — Priority Classification

Classify every finding before acting. Never start fixing without classifying first.

### P1 — BROKEN (fix now, before anything else)
Something is not working as intended for users or the system.

Examples:
- Tests failing in CI
- Build errors
- Runtime errors in production logs
- API returning wrong status codes
- Auth bypass or security hole
- Data being corrupted or lost

**Action:** Fix immediately in the current session. Do not move on.

### P2 — DEGRADED (fix this session)
Something works but is fragile, slow, or incorrect in edge cases.

Examples:
- Missing error handling on async operations
- Hardcoded value that should be an env var
- API endpoint missing auth check
- Component that crashes on empty data
- Test that passes but tests the wrong thing
- Dependency with a security warning

**Action:** Fix before closing the session. Add to ACTIVE.md if it will spill over.

### P3 — IMPROVEMENT (plan it)
Something that works but could be better. Does not require immediate action.

Examples:
- Function that could be split for clarity
- Missing test coverage for an edge case
- Outdated library that still works
- Pattern inconsistency (minor)
- Documentation gap

**Action:** Create a slice in planning/EXECUTION-PLAN.md. Do not fix now unless
the session has no P1/P2 work.

---

## Step 3: ACT

### For P1 and P2 findings
Follow the standard fix workflow:
1. Create a fix branch if not already on one
2. Write a failing test that proves the bug (TDD)
3. Fix the issue
4. Make the test pass
5. Run `npm run build` + `npm test` — must be green
6. Commit with `fix: [what was broken and where]`
7. Update CHANGELOG.md

### For P3 findings
Add to `planning/EXECUTION-PLAN.md` under the relevant phase:

```markdown
- [ ] **X.Y** [Domain] self-audit: [specific improvement]
      Found: [what triggered this]
      Effort: low | medium | high
```

Do not pad the execution plan with vague items. Every P3 slice must be:
- Specific enough to implement without further clarification
- Estimated (low/medium/high effort)
- Traceable back to a finding

---

## Step 4: REPORT

After every audit, write this to `planning/ACTIVE.md` (under "Audit Findings") and
to `memory/context-log.md`:

```markdown
## AUDIT REPORT: [DOMAIN] — [YYYY-MM-DD]
**Agent:** [frontend | backend | ops | data]
**Triggered by:** [scheduled | human | self]

### P1 Findings (broken — fixed this session)
- [What was broken] → [How it was fixed] → Commit: [sha]

### P2 Findings (degraded — fixed this session)
- [What was degraded] → [How it was fixed] → Commit: [sha]

### P3 Findings (improvements — planned as slices)
- [slice id] [Improvement title] → added to EXECUTION-PLAN.md

### Nothing found
[Write "Clean — no issues found in [files/areas scanned]" if truly nothing]

### What was NOT scanned
- [Any area intentionally skipped and why]
```

---

## Domain Audit Checklists

Each domain agent runs these checks on top of the universal ones above.

### Frontend Domain Audit
- [ ] All pages render without console errors?
- [ ] All forms validate and show error states correctly?
- [ ] All loading and empty states implemented?
- [ ] No broken images or missing `alt` text?
- [ ] No horizontal scroll on mobile (375px)?
- [ ] All interactive elements keyboard-navigable?
- [ ] No `useEffect` used for data fetching (use query layer)?
- [ ] No hardcoded colors or sizes (use design tokens)?
- [ ] All `'use client'` directives justified (server components by default)?

### Backend Domain Audit
- [ ] All API routes have auth checks on protected endpoints?
- [ ] All API routes validate input with Zod before touching the DB?
- [ ] All async operations have try/catch with meaningful error messages?
- [ ] No raw SQL string interpolation (use parameterized queries)?
- [ ] All webhook handlers verify signatures?
- [ ] No `SELECT *` in production queries?
- [ ] All new tables have RLS policies?
- [ ] All env vars documented in `.env.example`?

### Ops Domain Audit
- [ ] CI pipeline passing on all PRs?
- [ ] No secrets in environment variable names exposed in logs?
- [ ] Deploy process documented and working?
- [ ] Rollback procedure documented and tested?
- [ ] Monitoring/alerting configured for production errors?
- [ ] All new env vars added to deployment platform?

### Data Domain Audit
- [ ] All data pipelines have error handling and retry logic?
- [ ] No PII in logs or error messages?
- [ ] Query performance: any slow queries without indexes?
- [ ] Stale data: any caches that are no longer invalidated correctly?

---

## Escalation

If a P1 finding cannot be fixed within the current session (e.g. requires human
decision, external service, or credentials you don't have):

1. Document it clearly in the Audit Report
2. Add it to `planning/ACTIVE.md` at the top as a blocker
3. Mark it `Status: blocked` in the CHANGELOG entry
4. Do NOT proceed to P3 work while a P1 is blocked — flag it and stop

---

## Audit Frequency

| Trigger | Frequency |
|---|---|
| After any major feature ships | Every time |
| After a production incident | Immediately |
| Scheduled maintenance | Weekly (or per your team's cadence) |
| New developer onboarding | Once at the start |
| Before a big release | Always |

The orchestrator tracks the last audit date per domain in `memory/context-log.md`.
If a domain hasn't been audited in 14 days, the orchestrator flags it.
