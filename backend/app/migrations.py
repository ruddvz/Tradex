"""Run Alembic migrations programmatically (Docker entrypoint + app lifespan)."""

from __future__ import annotations

import logging
import os
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from .database import engine

logger = logging.getLogger(__name__)


def _alembic_config() -> Config:
    root = Path(__file__).resolve().parents[1]
    cfg = Config(str(root / "alembic.ini"))
    return cfg


def run_migrations() -> None:
    """
    Apply migrations to head.

    When ``ALEMBIC_AUTO_STAMP=true`` and the DB has tables but no ``alembic_version``
    row (legacy ``create_all`` installs), stamp head instead of re-running DDL.
    """
    cfg = _alembic_config()
    insp = inspect(engine)
    has_version = insp.has_table("alembic_version")
    has_core = insp.has_table("users")

    auto_stamp = os.environ.get("ALEMBIC_AUTO_STAMP", "").lower() in ("1", "true", "yes")
    if auto_stamp and has_core and not has_version:
        logger.info("Legacy database detected — stamping Alembic head (ALEMBIC_AUTO_STAMP)")
        command.stamp(cfg, "head")
        return

    logger.info("Running Alembic upgrade head")
    command.upgrade(cfg, "head")
