# Workflow 101 — Master Agent Instructions

> **MANDATORY:** Every AI agent in this repository follows this workflow. It ensures correct agent coordination, quality gates, and token efficiency.

---

## MANDATORY Phase 0: Context Gathering (Do This First, Every Time)

> **STOP. Before writing a single line of code, complete Phase 0. No exceptions.**

Run these in parallel before doing anything else:

1. **Read `planning/CHANGELOG.md`** — newest entry = where the previous agent stopped + explicit `Next up:` pointer
2. **Read `planning/ACTIVE.md`** — `NEXT UP` line at the top is the starting point
3. **Read `planning/EXECUTION-PLAN.md`** — phase checkbox state
4. **Check Git Status** — `git status` + `git log --oneline -5`

Only after Phase 0 is complete, proceed to the relevant workflow below.

---

## Phase 1: Planning and Analysis

- [ ] **Blast-Radius Analysis:** Identify all callers, dependents, and tests of files you'll touch. Flag surprising blast radius to user.
- [ ] **Invoke Planner:** Use `planner` agent for complex features (3+ files). Skip for single-file edits.
- [ ] **Consult Architect (if structural):** New routes, schema changes, new services → `architect` agent first.
- [ ] **Create Feature Branch:** For non-trivial changes: `git checkout -b feat/description`
- [ ] **Draft the Strategy:** Ask user for validation before writing code.

---

## Phase 2: Test-Driven Setup

- [ ] **Consult TDD Guide:** Use `tdd-guide` agent to outline tests for the change.
- [ ] **Prepare E2E Runner:** If UI flow changed, use `e2e-runner` for Playwright scenarios.
- [ ] **Write Failing Tests First (RED):** Create tests before implementation. Verify they fail.

---

## Phase 3: Execution

- [ ] **Implement:** Minimal, focused changes that solve the task. No over-engineering.
- [ ] **Make Tests Pass (GREEN):** Iterate until all tests pass.
- [ ] **Refactor (IMPROVE):** Clean up if needed, without changing behavior.

---

## Phase 4: Automated Verification

- [ ] **Build:** `npm run build` — zero errors
- [ ] **Tests:** `npm test` — all pass
- [ ] **Playwright E2E:** `playwright test` — if E2E tests exist for affected flows
- [ ] **Build Error Resolver:** If build/tests fail unexpectedly, use `build-error-resolver` agent

---

## Phase 5: Quality Review

- [ ] **Code Review:** Use `code-reviewer` agent with blast-radius file set. Must flag CRITICAL/HIGH issues.
- [ ] **Security Review:** Use `security-reviewer` agent. Mandatory for auth, payment, and API route changes.
- [ ] **Review Loop-Back:** CRITICAL issues → go back to Phase 3. Do NOT proceed with unresolved criticals.

> **Tip:** Code review and security review run in parallel (independent agents).

---

## Phase 6: Documentation & Memory

- [ ] **Update Codemaps:** If new files/routes added, update relevant codemaps
- [ ] **Update Docs:** If UI or API behavior changed, use `doc-updater` agent
- [ ] **Update EXECUTION-PLAN.md:** Mark completed items `[x]`
- [ ] **Update ACTIVE.md:** Move resolved bugs to "Completed" section

---

## Phase 7: Wrap-up & Loop

- [ ] **Ask User:** "What's the next step?" Continue loop until user is done.

---

## Phase 8: Safe Push to GitHub

> **NEVER push blindly.** Every push passes through these gates:

- [ ] **Build:** `npm run build` — zero errors
- [ ] **Lint:** `npm run lint` — resolve errors
- [ ] **Tests:** `npm test` — all pass
- [ ] **Diff Review:** `git diff --staged` — scan for:
    - Hardcoded secrets or API keys
    - Debug `console.log` left behind
    - Unintended file changes
    - Files that should be in `.gitignore`
- [ ] **Commit:** `git add [files]` + `git commit -m "type: description"`
- [ ] **Push:** `git push` — only after ALL checks green
- [ ] **Verify:** `git status` shows "up to date"
- [ ] **Update CHANGELOG.md** — append entry after every commit (see Session Handoff Protocol)

---

## Session Handoff Protocol (MANDATORY)

Every agent — without exception — must keep `planning/CHANGELOG.md` honest so the next agent (fresh context) can resume instantly.

1. **Append to `planning/CHANGELOG.md` after every commit.** One entry per commit, newest on top.
2. **Commit every logical slice.** A slice = a commit = a CHANGELOG entry. Never accumulate uncommitted WIP.
3. **Low-token handoff.** When context budget is tight (~20% remaining): STOP → commit WIP → push → write CHANGELOG entry with `Status: wip` + explicit `Next up:`. Never cram one more slice at low budget.
4. **`Next up:` is mandatory** on every entry. Name a slice id or a direct question for the human. Never leave empty.

**Entry format:**

```markdown
## YYYY-MM-DD HH:MM — branch-name — slice id: short title
- Commit: <sha> (type: subject)
- Files touched: path1, path2
- Tests added/changed: count (file)
- Build: pass | fail (reason)
- Status: done | wip | blocked (reason)
- Next up: slice id + short title OR explicit question for next agent
- Notes: gotchas, partial state, deferred decisions
```

---

## Department Self-Audit System

Every domain agent can — and should — audit its own area proactively.

### When to trigger an audit
- Human says "check the frontend", "what's broken in backend", "audit ops" → run that domain's audit immediately
- No explicit next task in `planning/ACTIVE.md` → run a self-audit instead of guessing
- Any domain unaudited for 14+ days → orchestrator flags it and offers to run
- After a production incident → audit the affected domain before closing
- After a major feature ships → audit all touched domains

### How to run an audit
1. Load `skills/core/self-audit.md`
2. Load your domain skill (`skills/team/frontend.md` etc.)
3. Run universal checks + domain-specific checklist
4. Triage: P1 (broken) → P2 (degraded) → P3 (improvement)
5. Fix P1 and P2 immediately — commit each fix
6. Add P3 items as slices in `planning/EXECUTION-PLAN.md`
7. Write the audit report to `planning/ACTIVE.md`

### Priority rule
**P1 (broken) → P2 (degraded) → P3 (improvement)**

Never work on P3 while a P1 or P2 is open in your domain.

---

## Quick Reference: Agents

| Agent | When to Use |
|-------|-------------|
| `planner` | Complex features (3+ files) |
| `architect` | New routes, schema changes, new services |
| `tdd-guide` | New features, bug fixes — write tests FIRST |
| `code-reviewer` | After writing any code |
| `security-reviewer` | Auth, payment, API route changes |
| `build-error-resolver` | Build or type errors |
| `e2e-runner` | UI flow changes |
| `typescript-reviewer` | TS/JS changes |
| `database-reviewer` | SQL, schema, RLS |
| `doc-updater` | After adding files/routes |

Run `code-reviewer` + `security-reviewer` **in parallel** (they're independent).
