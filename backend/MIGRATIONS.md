# Database migrations (Alembic)

Tradex uses **Alembic** for schema versioning. SQLAlchemy models in `app/models/` are the source of truth.

## Fresh database

From `backend/`:

```bash
export DATABASE_URL=postgresql://postgres:password@localhost:5432/tradex
python3 -m alembic upgrade head
```

Or continue using `init_db()` on app startup (`create_all`) for local dev — both paths create the same tables.

## Existing database (created with `create_all`)

If tables already exist, **stamp** the baseline without re-running DDL:

```bash
python3 -m alembic stamp head
```

Then use new revisions for schema changes only.

## New revision

```bash
python3 -m alembic revision --autogenerate -m "describe change"
python3 -m alembic upgrade head
```

## Initial revision

`alembic/versions/6bcb32ddfb52_initial_schema.py` — all core tables including `audit_logs`.
