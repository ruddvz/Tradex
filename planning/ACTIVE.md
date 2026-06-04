# Active Task Queue

## 👉 NEXT UP: **Maintenance** — merge audit stack PRs #23–#30; optional Plan0 device QA

See `planning/PHASE0-INVENTORY.md` and `planning/Plan0-AUDIT.md` for human QA.

---

## 🎯 Current Sprint

**Phase:** **Plan complete (Phases 0–8.2, E, Action Center, Live shell)** on `cursor/audit-complete-plan-parallel-b0b9`  
**Stack:** audit PRs #23–#30

### Recently Done (parallel completion)
- [x] **6.1–6.5** — API client (`settings`, `sync`, `paperAccounts`), shell account selector, live analytics without mock bleed, trade source badges, MT5 sync via API
- [x] **7.1–7.3** — Paper engine + UI rejection reasons + auto-load book (models/routes pre-existing)
- [x] **8.0–8.2** — Route split + Alembic + Docker migrate

### Open (post-plan / polish)
- [ ] Merge PR stack to `main`
- [ ] Plan0 manual device QA (optional)
- [ ] Dedicated `PaperViolation` model (deferred — audit events cover rejections today)

---

## Notes

- `computeMetrics` lives in `frontend/src/lib/metricsFromTrades.ts` (re-exported from `mockData` for demo).
- Long-range ideas: `planning/FULL-REPOSITORY-AUDIT-AND-IMPROVEMENT-PLAN.md` (beyond EXECUTION-PLAN slices).
