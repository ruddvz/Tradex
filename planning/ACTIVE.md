# Active Task Queue

## 👉 NEXT UP: **Plan0 manual device QA** (optional human checklist)

See `planning/Plan0-AUDIT.md` for browser/Lighthouse checks. Automated build/lint already pass in CI.

---

## 🎯 Current Sprint

**Phase:** **Post-plan (Phase 9)** on `cursor/post-plan-completion-b0b9`  
**Base:** `main` (audit stack merged)

### Recently Done
- [x] **9.1–9.6** — Violations model/API, playbooks CRUD, AI generate, account UI, paper equity, legacy deprecation headers
- [x] Merge audit stack to `main`

### Open (optional / long-range)
- [ ] Plan0 manual device QA
- [ ] Long-range: `planning/FULL-REPOSITORY-AUDIT-AND-IMPROVEMENT-PLAN.md` (live broker execution, deeper strategy lab)

---

## Notes

- `computeMetrics` lives in `frontend/src/lib/metricsFromTrades.ts` (re-exported from `mockData` for demo).
- Playbooks: saved via API + journal-derived merge (`frontend/src/lib/mergePlaybooks.ts`).
