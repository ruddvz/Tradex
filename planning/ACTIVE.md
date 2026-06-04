# Active Task Queue

> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## 👉 NEXT UP: **6.2** — Remaining mock surfaces + polish

Wire Calculator/Reports widgets that still read `mockData` when live; see `planning/EXECUTION-PLAN.md` Phase 6.

**Blocked by:** nothing

---

## 🎯 Current Sprint

**Phase:** Audit track **F + G** shipped on `cursor/audit-phase-f-g-parallel-b0b9`  
**Stack:** #23 → #24 → #25 → **#26** (F/G)

### Recently Done
- [x] **F** — StrategyRun model, paper runner (tick/pause/stop), audit events, Paper Trading panel
- [x] **G** — Live readiness checklist API + page, `broker_base` stub (live disabled)
- [x] **E** — Backtesting MVP + risk settings + live playbooks (#25)
- [x] **B/D** — Live charts + risk engine (#24)

### Open
- [ ] **6.2** — Full live/demo labeling on remaining pages
- [ ] **5** — PWA polish
- [ ] Alembic migrations / `routes.py` split (audit 8.0)

---

## Notes

- Read `planning/CHANGELOG.md` (newest) at session start
- Live execution: **always disabled** — `LiveExecutionDisabledError` on broker adapter
