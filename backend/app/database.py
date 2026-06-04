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
    if "notification_prefs" not in existing:
        statements.append("ALTER TABLE users ADD COLUMN notification_prefs JSON")
    for sql in statements:
        with engine.begin() as conn:
            conn.execute(text(sql))


def _ensure_trade_source_column() -> None:
    insp = inspect(engine)
    if not insp.has_table("trades"):
        return
    existing = {c["name"] for c in insp.get_columns("trades")}
    if "source" not in existing:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE trades ADD COLUMN source VARCHAR(32) DEFAULT 'manual'"))


def _ensure_paper_account_columns() -> None:
    insp = inspect(engine)
    if not insp.has_table("paper_accounts"):
        return
    existing = {c["name"] for c in insp.get_columns("paper_accounts")}
    alters: list[str] = []
    if "balance" not in existing:
        alters.append("ALTER TABLE paper_accounts ADD COLUMN balance DOUBLE PRECISION DEFAULT 100000")
    if "equity" not in existing:
        alters.append("ALTER TABLE paper_accounts ADD COLUMN equity DOUBLE PRECISION DEFAULT 100000")
    if "max_daily_loss" not in existing:
        alters.append("ALTER TABLE paper_accounts ADD COLUMN max_daily_loss DOUBLE PRECISION DEFAULT 500")
    if "max_risk_per_trade_percent" not in existing:
        alters.append(
            "ALTER TABLE paper_accounts ADD COLUMN max_risk_per_trade_percent DOUBLE PRECISION DEFAULT 1"
        )
    for sql in alters:
        with engine.begin() as conn:
            conn.execute(text(sql))
    if alters:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "UPDATE paper_accounts SET balance = COALESCE(balance, starting_balance), "
                    "equity = COALESCE(equity, starting_balance) WHERE balance IS NULL OR equity IS NULL"
                )
            )


def init_db() -> None:
    # Import models so they register metadata before create_all
    from .models import challenge  # noqa: F401
    from .models import manual_task  # noqa: F401
    from .models import notebook  # noqa: F401
    from .models import paper_account  # noqa: F401
    from .models import trade  # noqa: F401
    from .models import user  # noqa: F401
    from .models import trading_account  # noqa: F401
    from .models import paper  # noqa: F401
    from .models import paper_order  # noqa: F401
    from .models import paper_position  # noqa: F401
    from .models import paper_fill  # noqa: F401
    from .models import risk_profile  # noqa: F401
    from .models import audit_log  # noqa: F401
    from .models import bot_control  # noqa: F401
    from .models import backtest  # noqa: F401
    from .models import strategy_run  # noqa: F401
    from .models import strategy  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_user_mt5_columns()
    _ensure_trade_source_column()
    _ensure_paper_account_columns()
