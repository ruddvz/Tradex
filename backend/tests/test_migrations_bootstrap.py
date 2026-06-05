"""Bootstrap: legacy create_all DB can be stamped when ALEMBIC_AUTO_STAMP is set."""

from __future__ import annotations

import tempfile
from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

from app.models import user  # noqa: F401
from app.models.base import Base


def test_auto_stamp_legacy_database(monkeypatch):
    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "legacy.db"
        url = f"sqlite:///{db_path}"
        monkeypatch.setenv("DATABASE_URL", url)
        monkeypatch.setenv("ALEMBIC_AUTO_STAMP", "true")

        engine = create_engine(url)
        Base.metadata.create_all(bind=engine)
        assert "alembic_version" not in inspect(engine).get_table_names()

        import app.database as db_mod

        db_mod.engine = engine
        db_mod.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

        from app.migrations import run_migrations

        run_migrations()

        assert inspect(engine).has_table("alembic_version")
        with engine.connect() as conn:
            version = conn.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
        assert version == "a1b2c3d4e5f6"
