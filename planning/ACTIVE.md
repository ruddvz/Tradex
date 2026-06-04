# Active Task Queue

## 👉 NEXT UP: **8.2** — Alembic revision for incremental schema changes; optional `init_db` → migrate-only

See `backend/MIGRATIONS.md` and `planning/EXECUTION-PLAN.md`.

---

## 🎯 Current Sprint

**Phase:** **8.1** on `cursor/audit-phase-8-1-parallel-b0b9`  
**Stack:** audit PRs #23–#28

### Recently Done
- [x] **8.1** — Initial Alembic revision (all tables + `audit_logs`); domain route split
- [x] **5** — iPhone PWA (#28)
- [x] **8.0** — trades/analytics routers + Alembic env (#28)

### Open
- [ ] **8.2** — Stamp/migrate workflow in Docker Compose + drop ad-hoc ALTER when covered by Alembic

---

## Notes

- `computeMetrics` lives in `frontend/src/lib/metricsFromTrades.ts` (re-exported from `mockData` for demo).
