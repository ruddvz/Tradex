"""Database engine, session factory, and migrations."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Apply Alembic migrations on startup (see backend/MIGRATIONS.md)."""
    from .migrations import run_migrations

    run_migrations()
