"""JSON serializers shared across v1 route modules."""

from __future__ import annotations

from typing import Any, Dict

from fastapi import HTTPException

from ...core.mt5_crypto import decrypt_mt5_secret
from ...models.challenge import PropChallenge
from ...models.notebook import NotebookEntry
from ...models.paper_account import PaperAccount
from ...models.trading_account import TradingAccount
from ...models.user import User


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "plan": user.plan.value if hasattr(user.plan, "value") else str(user.plan),
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def notebook_to_dict(n: NotebookEntry) -> Dict[str, Any]:
    return {
        "id": n.id,
        "user_id": n.user_id,
        "title": n.title,
        "content": n.content,
        "type": n.entry_type,
        "tags": n.tags or [],
        "pinned": n.pinned,
        "created_at": n.created_at.isoformat() if n.created_at else None,
        "updated_at": n.updated_at.isoformat() if n.updated_at else None,
    }


def challenge_to_dict(c: PropChallenge) -> Dict[str, Any]:
    return {
        "id": c.id,
        "user_id": c.user_id,
        "name": c.name,
        "firm": c.firm,
        "account_size": c.account_size,
        "profit_target": c.profit_target,
        "max_drawdown": c.max_drawdown,
        "daily_drawdown": c.daily_drawdown,
        "min_trading_days": c.min_trading_days,
        "start_date": c.start_date,
        "end_date": c.end_date,
        "current_pnl": c.current_pnl,
        "current_drawdown": c.current_drawdown,
        "daily_loss": c.daily_loss,
        "status": c.status,
        "trades": c.trades_count,
        "days_traded": c.days_traded,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


def trading_account_to_dict(a: TradingAccount) -> Dict[str, Any]:
    return {
        "id": a.id,
        "user_id": a.user_id,
        "name": a.name,
        "broker": a.broker,
        "account_type": a.account_type.value if hasattr(a.account_type, "value") else str(a.account_type),
        "base_currency": a.base_currency,
        "starting_balance": a.starting_balance,
        "current_balance": a.current_balance,
        "current_equity": a.current_equity,
        "risk_per_trade_default": a.risk_per_trade_default,
        "max_daily_loss": a.max_daily_loss,
        "max_total_drawdown": a.max_total_drawdown,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


def paper_account_to_dict(p: PaperAccount) -> Dict[str, Any]:
    return {
        "id": p.id,
        "user_id": p.user_id,
        "name": p.name,
        "currency": p.currency,
        "starting_balance": p.starting_balance,
        "balance": p.balance,
        "equity": p.equity,
        "max_daily_loss": p.max_daily_loss,
        "max_risk_per_trade_percent": p.max_risk_per_trade_percent,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


def mt5_settings_public(user: User) -> dict:
    return {
        "server": user.mt5_server,
        "login": user.mt5_login,
        "has_password": bool(user.mt5_password_encrypted),
    }


def resolve_mt5_credentials(user: User, body) -> tuple[int, str, str]:
    login_i = body.login
    if login_i is None and user.mt5_login:
        s = user.mt5_login.strip()
        if s.isdigit():
            login_i = int(s)
    server = (body.server or user.mt5_server or "").strip() or None
    password = body.password
    if password is None and user.mt5_password_encrypted:
        password = decrypt_mt5_secret(user.mt5_password_encrypted)
    if login_i is None or not server or not password:
        raise HTTPException(
            status_code=400,
            detail="Missing MT5 credentials. Save server, login, and password in Settings, or include them in this request.",
        )
    return login_i, password, server
