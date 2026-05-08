---
name: workflows
description: >
  Step-by-step workflows for the most common tasks in this project. Load when
  starting any recurring process: adding a feature, running a migration, deploying,
  debugging a production issue, or any multi-step task with a defined correct
  sequence. This is the team's playbook — follow these exactly.
---

# Workflows

The canonical playbook for how we do things. Follow these exactly.

---

## Adding a New Feature (Full Flow)

```
Phase 0 — Context (mandatory):
  1. Read planning/CHANGELOG.md (newest entry)
  2. Read planning/ACTIVE.md (NEXT UP line)
  3. Read planning/EXECUTION-PLAN.md (find your slice)
  4. git status + git log --oneline -5
  5. Optional UX-only polish: follow `planning/Plan0.md` (audit + PWA checklist) — does not replace Phase 1 backend work

Phase 1 — Planning:
  6. Identify blast radius — which files, callers, tests are affected?
  7. For 3+ file changes: invoke `planner` agent
  8. For structural changes: invoke `architect` agent
  9. Create feature branch: git checkout -b cursor/short-description-2f22
  10. Validate strategy with human if non-trivial

Phase 2 — TDD:
  11. Invoke `tdd-guide` agent to outline tests
  12. Write failing tests FIRST (RED phase)
  13. Verify tests fail before implementing

Phase 3 — Execution:
  14. Implement the minimum viable solution
  15. Make tests pass (GREEN phase)
  16. Refactor to clean code (IMPROVE phase)

Phase 4 — Verification:
  17. cd frontend && npm run build (zero errors)
  18. cd backend && pytest -q; cd ../frontend && npm run lint
  19. Playwright tests if UI flow changed

Phase 5 — Review:
  20. code-reviewer + security-reviewer in PARALLEL
  21. Fix all CRITICAL and HIGH issues
  22. Re-run verification after fixes

Phase 6 — Docs:
  23. Update relevant codemaps if new files/routes added
  24. Mark slice done in planning/EXECUTION-PLAN.md [x]
  25. Update planning/ACTIVE.md

Phase 8 — Push:
  26. git add [specific files — not git add .]
  27. git diff --staged (scan for secrets, debug logs)
  28. git commit -m "feat: description"
  29. git push
  30. Update planning/CHANGELOG.md (MANDATORY)
  31. Create or update PR
```

---

## Database Migration

```
1. Never edit existing migrations — always create a new one
2. File naming: NNN_description.sql (sequential number)
3. Write the UP migration
4. Write the DOWN migration (rollback) — required
5. Test locally: run up → verify → run down → verify → run up again
6. Document in planning/EXECUTION-PLAN.md under the relevant slice
7. Coordinate timing for production — migrations run BEFORE code deploy
8. After deploy: verify no errors in DB logs

Commands (Alembic):
  cd backend && alembic upgrade head
  cd backend && alembic downgrade -1
  cd backend && alembic history
```

---

## Debugging a Production Issue

```
1. Check error logs FIRST — don't debug blind
   Docker: `docker compose logs` (nginx, backend). API: uvicorn/FastAPI logs.
2. Reproduce locally if possible
3. Identify: data issue vs code issue vs infra issue?
4. Identify the last deploy — was this introduced recently?
   git log --oneline -10
5. Fix in a branch, not directly on main
6. Test the fix locally
7. Deploy to staging, verify the fix
8. Deploy to production
9. Write post-mortem if user-impacting:
   - What happened
   - Why it happened
   - How we fixed it
   - How we prevent it
```

---

## Debugging a Failing Test

```
1. Read the test output LITERALLY — find the exact assertion that failed
2. Trace back to the code producing that value
3. Check:
   - Is the test setup correct? (mocks, fixtures, env vars)
   - Is the test assertion correct?
   - Is the implementation wrong?
4. Fix implementation (not the test) unless test is actually wrong
5. Run the full test suite after fixing — not just the failing test
6. If still failing after 3 attempts → invoke build-error-resolver agent
```

---

## Releasing to Production

```
1. Confirm branch is up to date with main
2. Run full verification: cd frontend && npm run build + (cd backend && pytest -q; cd ../frontend && npm run lint)
3. Check for pending DB migrations — coordinate timing
4. Create PR if not already done
5. Wait for CI to go green
6. Get PR review (required)
7. Merge to main
8. Monitor: error logs + key metrics for 30 min after deploy
9. If something breaks: [YOUR ROLLBACK PROCESS]
   - git revert <commit> or deploy previous version
10. Update planning/CHANGELOG.md with deployment note
```

---

## Adding a Third-Party Integration

```
1. Create lib/[service-name].ts (never initialize SDK in components)
2. Add required env vars to .env.example (names only, not values)
3. Document in skills/project/architecture.md under "Third-Party Integrations"
4. If the service uses webhooks:
   a. Create /api/webhooks/[service-name]/route.ts
   b. Verify webhook signatures — NEVER skip this
   c. Log all incoming webhook payloads during testing
5. Write tests for the happy path + auth failure
6. Invoke security-reviewer before merging
```

---

## Onboarding a New Developer

```
Day 1:
  1. Clone the repo
  2. cp .env.example .env and fill in values (ask [WHO] for values)
  3. cd frontend && npm install && cd ../backend && pip install -r requirements.txt
  4. docker-compose up -d (full stack) OR cd frontend && npm run dev (UI only)
  5. Read: README.md → planning/ACTIVE.md → skills/project/architecture.md
  6. Run the app locally and walk through the main user flows

Day 2:
  1. Pick up a "good first issue" from [WHERE ISSUES ARE TRACKED]
  2. Read the relevant skill files for the area you're working in
  3. Make a small change, open a PR — get comfortable with the process
```

---

## Writing and Running Tests

```
Framework: pytest (backend), ESLint (frontend)
E2E: Playwright (add when UI flows are covered)

Run backend tests:     cd backend && pytest -q
Run frontend lint:     cd frontend && npm run lint
Run single test:       cd backend && pytest path/to_test.py -q

What must be tested:
  - Analytics and services in backend/app/services/
  - API routes (happy path + auth + validation) once auth lands
  - Complex UI state (Journal drawer, filters) when a harness exists

What doesn't need tests:
  - Simple display components with no logic
  - Config files
  - Trivial one-liners

TDD sequence (MANDATORY for new features):
  1. Write the test (it should FAIL — verify this)
  2. Write the minimum implementation to make it pass
  3. Refactor
  4. Never write tests after the implementation
```

---

## Recent Schema Changes

Track recent database changes here:

| Date | Change | Migration file | Who |
|---|---|---|---|
| [YYYY-MM-DD] | [Description] | [filename] | [name] |
