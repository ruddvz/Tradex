"""Aggregate setup / dependency health for Action Center and ops."""

from __future__ import annotations

from typing import Any, Dict, List

from sqlalchemy import text
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.user import User


def _check_database(db: Session) -> str:
    try:
        db.execute(text("SELECT 1")).scalar()
        return "ok"
    except Exception:
        return "error"


def _check_redis() -> str:
    try:
        import redis

        r = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1.0, socket_timeout=1.0)
        if r.ping():
            return "ok"
        return "error"
    except Exception:
        return "error"


def compute_setup_health(db: Session, user: User) -> Dict[str, Any]:
    """
    Return coarse status for core dependencies and user-specific connectors.
    Values are string tokens consumed by the Action Center UI.
    """
    critical: List[str] = []

    db_status = _check_database(db)
    if db_status != "ok":
        critical.append("database_unreachable")

    if settings.SECRET_KEY.strip() in (
        "",
        "your-secret-key-change-in-production",
        "changeme",
    ):
        critical.append("weak_or_default_secret_key")

    redis_status = _check_redis()

    if settings.OPENAI_API_KEY:
        openai_status = "ok"
    else:
        openai_status = "missing_optional"

    mt5_ok = bool(
        (user.mt5_server or "").strip()
        and (user.mt5_login or "").strip()
        and user.mt5_password_encrypted
    )
    mt5_status = "configured" if mt5_ok else "not_configured"

    return {
        "database": db_status,
        "redis": redis_status,
        "openai": openai_status,
        "mt5": mt5_status,
        "pwa": "frontend_only",
        "paper_account": "missing",
        "risk_rules": "missing",
        "critical_issues": critical,
    }
