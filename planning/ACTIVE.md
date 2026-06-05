# Active Task Queue

## 👉 NEXT UP: **Human validation only**

Status: [x] P2 engineering complete (2026-06-05)

**Canonical state:** `planning/CURRENT-STATE-AND-NEXT-WORK.md`

---

## 🎯 Current Sprint

**Phase:** Post-audit — plan complete  
**Branch:** `main` (merge via PR after P2)

### Recently Done (P2 — 2026-06-05)
- [x] httpOnly cookie auth + refresh rotation + logout
- [x] Frontend session bootstrap (`AuthBootstrap`, `ProtectedLayout` refresh)
- [x] EXIF strip on screenshot uploads (Pillow)
- [x] Metrics parity golden fixture test
- [x] `scripts/docker-verify.sh` for local full-stack check
- [x] Auth token/cookie unit tests

### Human-only follow-ups
- [ ] Docker full-stack verification (`./scripts/docker-verify.sh`)
- [ ] Physical iPhone PWA install QA (`planning/DEVICE-QA.md`)
- [ ] GitHub branch protection requiring CI green

---

## Notes

- Verification: `./scripts/verify.sh` (53 pytest, lint, metrics parity, build, SW, e2e x3)
- Product identity: **trading performance lab** — no live execution
