# Active Task Queue

## 👉 NEXT UP: **[11.1] — Paper order lifecycle states**

Status: [ ] pending

Goal: Complete paper order state machine (draft → submitted → accepted/rejected → filled/cancelled/expired).

After completion: move to **[11.2]** spread/slippage/commission assumptions.

See `planning/ROADMAP-2026-Q2.md` and `planning/EXECUTION-PLAN.md` Phase 11.

---

## 🎯 Current Sprint

**Phase:** **11 — Paper trading realism**  
**Branch:** `cursor/phase-10-stabilization-a3a6`  
**Base:** `main` + Phase 9–10 merged

### Recently Done (Phase 10)
- [x] **10.1** Phase 9 post-plan merged (violations, playbooks API, account UI, paper equity)
- [x] **10.2** `ROADMAP-2026-Q2.md` + deduplicated `EXECUTION-PLAN.md`
- [x] **10.3** `DataModeBadge` on header + backtests; demo/live/paper/backtest copy
- [x] **10.4** `demo_mt5_sample` source + journal source filters
- [x] **10.5** Risk Center (`/risk`) + `GET /risk/profile` + dashboard violation link

---

## Notes

- Product identity: **trading performance lab**, not a live money bot.
- `DataModeBadge` lives in `frontend/src/components/ui/DataModeBadge.tsx`.
- Risk APIs: `GET /api/v1/risk/profile`, `/risk/violations`, `/risk/events`.
