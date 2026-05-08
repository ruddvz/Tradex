"""Database engine, session factory, and table creation."""

from sqlalchemy import create_engine
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


def init_db() -> None:
    # Import models so they register metadata before create_all
    from .models import trade  # noqa: F401
    from .models import user  # noqa: F401

    Base.metadata.create_all(bind=engine)
