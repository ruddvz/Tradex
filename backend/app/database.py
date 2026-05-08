"""Database engine, session factory, and table creation."""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker

from .core.config import settings
from .models.base import Base

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _ensure_user_mt5_columns() -> None:
    """Add MT5 credential columns when upgrading an existing DB (create_all skips new columns)."""
    insp = inspect(engine)
    if not insp.has_table("users"):
        return
    existing = {c["name"] for c in insp.get_columns("users")}
    statements: list[str] = []
    if "mt5_server" not in existing:
        statements.append("ALTER TABLE users ADD COLUMN mt5_server VARCHAR(255)")
    if "mt5_login" not in existing:
        statements.append("ALTER TABLE users ADD COLUMN mt5_login VARCHAR(64)")
    if "mt5_password_encrypted" not in existing:
        statements.append("ALTER TABLE users ADD COLUMN mt5_password_encrypted TEXT")
    for sql in statements:
        with engine.begin() as conn:
            conn.execute(text(sql))


def init_db() -> None:
    # Import models so they register metadata before create_all
    from .models import trade  # noqa: F401
    from .models import user  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_user_mt5_columns()
