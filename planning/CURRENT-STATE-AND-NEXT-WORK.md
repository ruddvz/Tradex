# Tradex — Current State and Next Work

**Updated:** 2026-06-05  
**Branch baseline:** `main` (Phases 0–15 shipped via PR #34)

---

## Product identity

TradeX is a **trading performance lab** — journal trades, import MT5 history, simulate paper orders, run backtest experiments, monitor risk, and get AI-assisted **behavioral** review. It is **not** a real-money automated trading bot.

---

## What is truly done (verified in repo)

| Area | Status | Evidence |
|------|--------|----------|
| Auth + PostgreSQL | Done | JWT, SQLAlchemy models, Alembic migrations |
| Trade screenshots | Done | Upload API + Journal drawer |
| MT5 sync | Done | `/sync/mt5`, encrypted credentials, duplicate ticket skip |
| Daily email + Celery | Done | `email_service.py`, beat schedule, settings toggle |
| PWA + mobile nav | Done | manifest, service worker, safe-area CSS, bottom nav |
| Data mode badges | Done | `DataModeBadge`, `PageDataTrustBar`, Header strip |
| Paper trading | Done | Lifecycle states, fill assumptions, violations, cockpit UI |
| Backtesting | Done | Synthetic OHLC MVP, assumptions panel, trust warnings |
| Strategy runner | Done | Paper-only ticks; `DisabledLiveBroker` blocks live |
| AI trust layer | Done | Phrase scrub + metadata (`data_used`, `confidence`, `limitations`) |
| Risk Center | Done | `/risk`, profiles, violations, kill switch |
| Verification gate | Done | `./scripts/verify.sh` — pytest, lint, build, SW, e2e |

### Latest verification run (2026-06-05, cloud agent)

```
Backend pytest:  45 passed (P1 import batches, CSV candles, strategy versions, OOS)
Frontend lint:   pass
Frontend build:  pass
Service worker:  dist/sw.js present
Playwright e2e:  3 passed
Docker Compose:  not run in cloud VM (no docker); validate locally
```

---

## What is verified by automated tests

- Alembic upgrade head (SQLite + legacy stamp bootstrap)
- Paper order lifecycle (filled / rejected paths)
- Paper violations + risk engine
- Strategy runner (paper-only)
- Backtesting synthetic labelling
- AI trust scrub (banned phrases + metadata)
- Live broker disabled (`DisabledLiveBroker`)
- MT5 demo fallback gates (`DEBUG` + `ALLOW_DEMO_MT5_FALLBACK`)
- Production `SECRET_KEY` guard when `DEBUG=false`
- Import batch API + MT5 sync batch tracking
- CSV candle upload + `csv_upload` backtest data label
- Strategy version snapshots on create/backtest/paper run
- Walk-forward OOS warnings on backtest results

---

## What is only claimed by docs (needs human / prod validation)

- GitHub Pages deploy on every `main` push
- iOS installed PWA on physical device (see `planning/DEVICE-QA.md`)
- Docker full stack on clean volume (Postgres, Redis, Celery worker + beat)
- Real MT5 terminal import on Windows with MetaTrader5 package
- SMTP delivery in production

---

## What is intentionally not available

- **Live broker order execution** — blocked in code and UI
- **Real-money bot mode** — not a product goal
- **Production-grade auth** — JWT in localStorage; httpOnly cookies deferred (P2)
- **Real historical candle feeds by default** — backtests default to synthetic OHLC; CSV upload available
- ~~**Import batch audit UI**~~ — done (Settings → Import History)
- ~~**Walk-forward / OOS optimization**~~ — OOS warnings shipped; full optimization UI deferred

---

## Data mode matrix (canonical)

| Mode | Auth? | Data source | Badge | Can write? |
|------|------:|-------------|-------|----------:|
| Demo | No | `mockData.ts` | DEMO | Local only |
| Live journal | Yes | API / PostgreSQL | LIVE JOURNAL | Yes |
| MT5 import | Yes | API, `source=mt5` | MT5 IMPORTED | Notes/edit |
| Demo MT5 sample | Yes/dev | `source=demo_mt5_sample` | DEMO SAMPLE | Dev only |
| Paper | Yes | Paper tables | PAPER | Simulated only |
| Backtest | Yes | Backtest tables, synthetic | BACKTEST | No journal pollution |

---

## Next work (priority order)

### P0 — complete in this audit pass

- [x] Reconcile planning docs (`NEXT_STEPS`, `ACTIVE`, this file)
- [x] Safety tests: live disabled, MT5 fallback, AI trust expansion
- [x] CI: frontend + backend + security workflows
- [x] Prettier check + format scripts
- [x] `PageDataTrustBar` on major journal/analytics pages
- [x] `DEVICE-QA.md` checklist with viewport notes

### P1 — next engineering slices

1. ~~**Import batches**~~ — done (`import_batches` + Settings Import History + MT5 sync wiring)
2. ~~**CSV candle provider**~~ — done (upload + backtest integration)
3. ~~**Strategy versioning**~~ — done (`strategy_versions` + backtest/paper run FKs)
4. **Metrics single source of truth** — backend fixtures mirrored in frontend (partial — journal analytics exist)
5. ~~**Walk-forward / OOS warnings**~~ — done on backtest results

### P2 — before public production (next)

- httpOnly cookie auth + refresh rotation
- Rate limiting + security headers
- Upload MIME/magic-byte validation + EXIF strip
- Branch protection requiring CI green

---

## Phase numbering map

| Doc reference | Meaning |
|---------------|---------|
| Phases 0–5 | Original NEXT_STEPS (setup → PWA) |
| Phases 6–8 | Audit stabilization (live data, paper, Alembic) |
| Phase 9 | Post-plan (violations, playbooks API, paper equity) |
| Phase 10 | Data modes + Risk Center |
| Phases 11–15 | Paper realism, backtest trust, dashboard UX, AI trust, verify/e2e |
| Phase E | Backtesting MVP (parallel audit track) |

Do **not** re-open completed Phase 4/5 email/PWA tasks unless regressions are found.

---

## Agent start checklist

1. Read this file + `planning/ACTIVE.md` + latest `planning/CHANGELOG.md` entry
2. Run `./scripts/verify.sh`
3. If adding features, pick from **P1** above — do not skip verification
4. Never enable live execution or hide demo/synthetic labels
