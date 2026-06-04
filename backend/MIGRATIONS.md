# Database migrations (Alembic)

Tradex uses **Alembic** as the schema source of truth. `init_db()` on API startup runs `alembic upgrade head` (see `app/migrations.py`).

## Docker Compose

The backend container runs migrations before Uvicorn:

```bash
docker compose up -d
# → waits for Postgres, then `alembic upgrade head`, then API
```

`ALEMBIC_AUTO_STAMP=true` is set in Compose for dev: if the volume already has tables from an older `create_all` install but no `alembic_version` table, the app **stamps** `head` instead of failing on duplicate DDL.

## Local (no Docker)

From `backend/`:

```bash
export DATABASE_URL=postgresql://postgres:password@localhost:5432/tradex
python3 -m alembic upgrade head
uvicorn app.main:app --reload
```

Or rely on lifespan `init_db()` when the API starts.

## Existing database (manual stamp)

If you see duplicate-table errors on upgrade:

```bash
python3 -m alembic stamp head
```

Only do this when the schema already matches the initial revision.

## New revision

```bash
python3 -m alembic revision --autogenerate -m "describe change"
python3 -m alembic upgrade head
```

## Initial revision

`alembic/versions/6bcb32ddfb52_initial_schema.py` — all core tables including `audit_logs`.
