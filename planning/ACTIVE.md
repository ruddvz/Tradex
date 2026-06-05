# Active Task Queue

## 👉 NEXT UP: **P1.2 — Import batches (MT5 transparency)**

Status: [ ] pending

Phases **0–15** are complete. Audit hardening (P0) is done on branch `cursor/audit-plan-complete-32fb`.

**Canonical state:** `planning/CURRENT-STATE-AND-NEXT-WORK.md`

---

## 🎯 Current Sprint

**Phase:** Post-audit P1 backlog  
**Branch:** `cursor/audit-plan-complete-32fb` (or new `cursor/<slice>-32fb`)

### Recently Done (Audit P0 — 2026-06-05)
- [x] Safety tests — live broker disabled, MT5 fallback, AI trust expansion
- [x] Planning reconciliation — `CURRENT-STATE-AND-NEXT-WORK.md`, `NEXT_STEPS.md`, `DEVICE-QA.md`
- [x] CI workflows — frontend, backend, security
- [x] Prettier + `PageDataTrustBar` on major pages
- [x] Production `SECRET_KEY` guard on app startup

---

## Notes

- Verification: `./scripts/verify.sh`
- Product identity: **trading performance lab** — no live execution
- Manual iPhone PWA: `planning/DEVICE-QA.md` (device steps for humans)
