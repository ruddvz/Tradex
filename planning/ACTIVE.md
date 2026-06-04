# Active Task Queue

## 👉 NEXT UP: **6.1** — API client layer polish (`frontend/src/lib/api/*`) + centralized errors

See `planning/EXECUTION-PLAN.md` Phase 6 (P0 stabilization).

---

## 🎯 Current Sprint

**Phase:** **8.2** on `cursor/audit-phase-8-2-parallel-b0b9`  
**Stack:** audit PRs #23–#29

### Recently Done
- [x] **8.2** — Docker migrate entrypoint; Alembic-only `init_db`; `ALEMBIC_AUTO_STAMP` for legacy volumes
- [x] **8.1** — Initial Alembic revision + route split (#29)
- [x] **5** — iPhone PWA (#28)

### Open
- [ ] **6.1** — API client layer + auth/error handling
- [ ] **6.3** — AddTradeModal server validation field mapping (422 detail)

---

## Notes

- `computeMetrics` lives in `frontend/src/lib/metricsFromTrades.ts` (re-exported from `mockData` for demo).
