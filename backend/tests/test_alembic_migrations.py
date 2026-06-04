"""Alembic upgrade smoke test on SQLite."""

from __future__ import annotations

import tempfile
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect


def test_alembic_upgrade_head_sqlite():
    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "test.db"
        url = f"sqlite:///{db_path}"
        import os

        os.environ["DATABASE_URL"] = url
        cfg = Config("alembic.ini")
        command.upgrade(cfg, "head")

        engine = create_engine(url)
        tables = set(inspect(engine).get_table_names())
        engine.dispose()

    assert "users" in tables
    assert "trades" in tables
    assert "audit_logs" in tables
    assert "paper_accounts" in tables
