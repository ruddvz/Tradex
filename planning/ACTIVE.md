# Active Task Queue

## 👉 NEXT UP: **P2 — Production security hardening**

Status: [ ] pending

P0 audit and P1 backlog are complete on branch `cursor/audit-plan-complete-32fb`.

**Canonical state:** `planning/CURRENT-STATE-AND-NEXT-WORK.md`

---

## 🎯 Current Sprint

**Phase:** Post-audit P2 (production readiness)  
**Branch:** `cursor/audit-plan-complete-32fb`

### Recently Done (P1 — 2026-06-05)
- [x] Import batches model + API + MT5 sync audit trail + Settings Import History
- [x] CSV candle upload + honest backtest `data_label=csv_upload`
- [x] Strategy versioning (immutable snapshots for backtest + paper runs)
- [x] Walk-forward OOS warnings on backtest results
- [x] 45 pytest + verify.sh green

### Recently Done (P2 partial — 2026-06-05)
- [x] Security headers + request ID middleware
- [x] Auth rate limiting (login/register)
- [x] Screenshot upload magic-byte validation + randomized filenames

### Next P2 slices
- [ ] httpOnly cookie auth + refresh rotation
- [ ] Docker full-stack verification (human/local)
- [ ] Metrics parity fixtures (Reports ↔ backend)

---

## Notes

- Verification: `./scripts/verify.sh` (45 pytest, lint, build, SW, e2e x3)
- Product identity: **trading performance lab** — no live execution
