# Active Task Queue

## 👉 NEXT UP: **Maintenance — optional Plan0 device QA**

Status: [ ] optional (human)

Phases **0–15** from `planning/EXECUTION-PLAN.md` are complete on branch `cursor/phases-11-15-a3a6`.

See `planning/Plan0-AUDIT.md` for manual iPhone/Lighthouse checks.

---

## 🎯 Current Sprint

**Phase:** **Complete (Q2 2026 roadmap)**  
**Branch:** `cursor/phases-11-15-a3a6`

### Recently Done (Phases 11–15)
- [x] **11** — Paper order lifecycle, per-account fill assumptions, paper cockpit UI
- [x] **12** — Backtest assumptions panel, `/reports/compare`, export trust copy
- [x] **13** — Dashboard status strip, PWA-safe inputs, empty states
- [x] **14** — AI trust metadata + prediction language scrub
- [x] **15** — `scripts/verify.sh`, Playwright e2e, expanded pytest

---

## Notes

- Verification: `./scripts/verify.sh` (pytest + lint + build + SW + e2e)
- Product identity: **trading performance lab** — no live execution
- E2E lives in `e2e/` (Playwright, production preview + `/Tradex/` base)
