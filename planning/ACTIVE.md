# Active Task Queue

## 👉 NEXT UP: **5** — PWA polish (maskable icons, offline UX refinements)

See `planning/EXECUTION-PLAN.md` Phase 5.

---

## 🎯 Current Sprint

**Phase:** **6.2** live surface polish shipped on `cursor/audit-phase-6-parallel-b0b9`  
**Stack:** audit PRs #23–#26 + this PR

### Recently Done
- [x] **6.2** — Reports/Calculator/Journal/Paper live labels; shared `metricsFromTrades`; Dashboard `RiskStatusCard`
- [x] **F/G** — Strategy runner + live readiness (#26)
- [x] **E** — Backtests + risk settings (#25)

### Open
- [ ] **5** — PWA manifest / mobile polish
- [ ] **8.0** — Split `routes.py` + Alembic

---

## Notes

- `computeMetrics` lives in `frontend/src/lib/metricsFromTrades.ts` (re-exported from `mockData` for demo).
