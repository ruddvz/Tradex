"""Live execution readiness checklist — informational only; live orders stay disabled."""

from __future__ import annotations

from typing import Any

from sqlalchemy import func as sql_func, select
from sqlalchemy.orm import Session

from ..models.audit_log import AuditLog
from ..models.backtest import Backtest
from ..models.paper_account import PaperAccount
from ..models.risk_profile import RiskProfile
from ..models.trade import Trade
from .risk_engine import get_or_create_bot_control


def compute_live_readiness(db: Session, user_id: str) -> dict[str, Any]:
    control = get_or_create_bot_control(db, user_id)

    risk_count = int(
        db.execute(select(sql_func.count()).select_from(RiskProfile).where(RiskProfile.user_id == user_id)).scalar()
        or 0
    )
    paper_accounts = int(
        db.execute(
            select(sql_func.count()).select_from(PaperAccount).where(PaperAccount.user_id == user_id)
        ).scalar()
        or 0
    )
    paper_trades = int(
        db.execute(
            select(sql_func.count()).select_from(Trade).where(Trade.user_id == user_id, Trade.source == "paper")
        ).scalar()
        or 0
    )
    backtest_count = int(
        db.execute(select(sql_func.count()).select_from(Backtest).where(Backtest.user_id == user_id)).scalar() or 0
    )
    audit_count = int(
        db.execute(select(sql_func.count()).select_from(AuditLog).where(AuditLog.user_id == user_id)).scalar() or 0
    )

    min_paper_trades = 10
    items = [
        {
            "id": "live_execution_enabled",
            "label": "Live execution enabled",
            "passed": False,
            "required": True,
            "detail": "Intentionally off — broker adapter raises LiveExecutionDisabledError until manual approval.",
        },
        {
            "id": "kill_switch_clear",
            "label": "Kill switch not active",
            "passed": not control.kill_switch_active,
            "required": True,
            "detail": "Clear the kill switch after testing so paper automation can run.",
        },
        {
            "id": "risk_profile",
            "label": "Risk profile configured",
            "passed": risk_count > 0,
            "required": True,
            "detail": f"{risk_count} profile(s) on file.",
        },
        {
            "id": "paper_account",
            "label": "Paper account exists",
            "passed": paper_accounts > 0,
            "required": True,
            "detail": f"{paper_accounts} paper account(s).",
        },
        {
            "id": "paper_sample",
            "label": f"Minimum {min_paper_trades} paper journal trades",
            "passed": paper_trades >= min_paper_trades,
            "required": True,
            "detail": f"{paper_trades} / {min_paper_trades} closed paper trades in journal.",
        },
        {
            "id": "backtest_run",
            "label": "At least one backtest completed",
            "passed": backtest_count > 0,
            "required": False,
            "detail": f"{backtest_count} saved backtest(s). Compare assumptions to paper fills.",
        },
        {
            "id": "audit_trail",
            "label": "Audit events recorded",
            "passed": audit_count > 0,
            "required": False,
            "detail": f"{audit_count} audit log entries.",
        },
    ]

    required = [i for i in items if i["required"]]
    passed_required = sum(1 for i in required if i["passed"])
    ready = passed_required == len(required) and not control.kill_switch_active

    return {
        "live_execution_enabled": False,
        "ready_for_review": ready,
        "passed_required": passed_required,
        "total_required": len(required),
        "items": items,
        "disclaimer": (
            "Meeting this checklist does not enable live trading. "
            "Tradex remains paper and journal only until explicit product approval."
        ),
        "paper_vs_backtest_hint": (
            "Compare backtest metrics (synthetic candles) to paper fills before considering any live path."
        ),
    }
