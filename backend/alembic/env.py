"""Alembic environment — DATABASE_URL from env, alembic.ini, or app settings."""

from __future__ import annotations

import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.models.base import Base

# Import models so metadata is populated for autogenerate.
from app.models import (  # noqa: F401
    audit_log,
    backtest,
    bot_control,
    candle_dataset,
    challenge,
    import_batch,
    manual_task,
    notebook,
    paper,
    paper_account,
    paper_fill,
    paper_order,
    paper_position,
    paper_violation,
    playbook,
    risk_profile,
    strategy,
    strategy_run,
    strategy_version,
    trade,
    trading_account,
    user,
)

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

def _database_url() -> str:
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]
    ini_url = config.get_main_option("sqlalchemy.url")
    if ini_url and not ini_url.startswith("driver://"):
        return ini_url
    return settings.DATABASE_URL


config.set_main_option("sqlalchemy.url", _database_url())

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
