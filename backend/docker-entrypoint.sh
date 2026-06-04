#!/usr/bin/env bash
set -euo pipefail
cd /app
export PYTHONPATH=/app

echo "[tradex] Waiting for database..."
python3 - <<'PY'
import os
import time
from sqlalchemy import create_engine, text

url = os.environ.get("DATABASE_URL", "")
if not url:
    raise SystemExit("DATABASE_URL is not set")

engine = create_engine(url, pool_pre_ping=True)
for attempt in range(60):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[tradex] Database is ready")
        break
    except Exception as exc:
        if attempt == 59:
            raise SystemExit(f"Database not ready after 60 attempts: {exc}") from exc
        time.sleep(1)
finally:
    engine.dispose()
PY

echo "[tradex] Applying migrations..."
python3 -m alembic upgrade head

exec "$@"
