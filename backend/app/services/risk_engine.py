"""Central risk evaluation for paper orders (MVP)."""

from __future__ import annotations

import json
import uuid
from typing import Optional, Tuple

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.audit_log import AuditLog
from ..models.bot_control import BotControl
from ..models.paper_violation import PaperViolation
from ..models.paper_order import PaperOrderSide
from ..models.risk_profile import RiskProfile


def log_audit_event(
    db: Session,
    *,
    user_id: str,
    entity_type: str,
    entity_id: Optional[str],
    event_type: str,
    severity: str,
    message: str,
    metadata: Optional[dict] = None,
) -> None:
    db.add(
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            event_type=event_type,
            severity=severity,
            message=message,
            metadata_json=json.dumps(metadata) if metadata else None,
        )
    )


def log_paper_violation(
    db: Session,
    *,
    user_id: str,
    violation_type: str,
    reason: str,
    severity: str = "warning",
    paper_account_id: Optional[str] = None,
    paper_order_id: Optional[str] = None,
) -> None:
    db.add(
        PaperViolation(
            id=str(uuid.uuid4()),
            user_id=user_id,
            paper_account_id=paper_account_id,
            paper_order_id=paper_order_id,
            violation_type=violation_type,
            reason=reason,
            severity=severity,
        )
    )


def get_or_create_bot_control(db: Session, user_id: str) -> BotControl:
    row = db.get(BotControl, user_id)
    if row is None:
        row = BotControl(user_id=user_id)
        db.add(row)
        db.flush()
    return row


def get_default_risk_profile(db: Session, user_id: str) -> Optional[RiskProfile]:
    return db.execute(
        select(RiskProfile).where(RiskProfile.user_id == user_id).order_by(RiskProfile.created_at.asc())
    ).scalars().first()


def ensure_default_risk_profile(db: Session, user_id: str) -> RiskProfile:
    existing = get_default_risk_profile(db, user_id)
    if existing:
        return existing
    row = RiskProfile(
        id=str(uuid.uuid4()),
        user_id=user_id,
        name="Conservative default",
    )
    db.add(row)
    db.flush()
    return row


def _block(
    db: Session,
    *,
    user_id: str,
    event_type: str,
    severity: str,
    message: str,
    paper_account_id: Optional[str] = None,
    paper_order_id: Optional[str] = None,
) -> Tuple[bool, Optional[str]]:
    log_audit_event(
        db,
        user_id=user_id,
        entity_type="paper_order",
        entity_id=paper_order_id,
        event_type=event_type,
        severity=severity,
        message=message,
    )
    log_paper_violation(
        db,
        user_id=user_id,
        violation_type=event_type,
        reason=message,
        severity=severity,
        paper_account_id=paper_account_id,
        paper_order_id=paper_order_id,
    )
    return False, message


def evaluate_paper_order(
    db: Session,
    *,
    user_id: str,
    symbol: str,
    side: PaperOrderSide,
    lot_size: float,
    entry_price: float,
    stop_loss: Optional[float],
    account_balance: float,
    open_positions_count: int,
    open_positions_same_symbol: int,
    risk_at_stop_dollars: float,
    paper_account_id: Optional[str] = None,
    paper_order_id: Optional[str] = None,
) -> Tuple[bool, Optional[str]]:
    """
    Returns (approved, rejection_reason).
    Logs audit events for blocks and approvals.
    """
    control = get_or_create_bot_control(db, user_id)
    if control.kill_switch_active:
        msg = "Kill switch is active — no new orders allowed."
        return _block(
            db,
            user_id=user_id,
            event_type="KILL_SWITCH_BLOCKED",
            severity="critical",
            message=msg,
            paper_account_id=paper_account_id,
            paper_order_id=paper_order_id,
        )

    if control.paper_orders_paused:
        msg = "Paper orders are paused."
        return _block(
            db,
            user_id=user_id,
            event_type="PAPER_PAUSED_BLOCKED",
            severity="warning",
            message=msg,
            paper_account_id=paper_account_id,
            paper_order_id=paper_order_id,
        )

    profile = get_default_risk_profile(db, user_id)
    if profile is None:
        profile = ensure_default_risk_profile(db, user_id)

    if profile.require_stop_loss and (stop_loss is None or stop_loss <= 0):
        msg = "Stop loss is required by your risk profile."
        return _block(
            db,
            user_id=user_id,
            event_type="ORDER_BLOCKED_NO_STOP",
            severity="danger",
            message=msg,
            paper_account_id=paper_account_id,
            paper_order_id=paper_order_id,
        )

    if profile.blocked_symbols:
        blocked = {s.strip().upper() for s in profile.blocked_symbols.split(",") if s.strip()}
        if symbol.upper() in blocked:
            msg = f"Symbol {symbol} is blocked by your risk profile."
            return _block(
                db,
                user_id=user_id,
                event_type="ORDER_BLOCKED_SYMBOL",
                severity="danger",
                message=msg,
                paper_account_id=paper_account_id,
                paper_order_id=paper_order_id,
            )

    max_risk = account_balance * (profile.max_risk_per_trade_percent / 100.0)
    if risk_at_stop_dollars > max_risk:
        msg = (
            f"Order blocked: risk at stop (${risk_at_stop_dollars:.0f}) exceeds "
            f"{profile.max_risk_per_trade_percent:.1f}% of balance (${max_risk:.0f})."
        )
        return _block(
            db,
            user_id=user_id,
            event_type="ORDER_BLOCKED_RISK_PER_TRADE",
            severity="danger",
            message=msg,
            paper_account_id=paper_account_id,
            paper_order_id=paper_order_id,
        )

    max_daily_loss = account_balance * (profile.max_daily_loss_percent / 100.0)
    if risk_at_stop_dollars > max_daily_loss:
        msg = f"Order blocked: risk exceeds daily loss cap (${max_daily_loss:.0f})."
        return _block(
            db,
            user_id=user_id,
            event_type="ORDER_BLOCKED_DAILY_RISK",
            severity="danger",
            message=msg,
            paper_account_id=paper_account_id,
            paper_order_id=paper_order_id,
        )

    if open_positions_count >= profile.max_open_positions:
        msg = f"Order blocked: max open positions ({profile.max_open_positions}) reached."
        return _block(
            db,
            user_id=user_id,
            event_type="ORDER_BLOCKED_MAX_POSITIONS",
            severity="danger",
            message=msg,
            paper_account_id=paper_account_id,
            paper_order_id=paper_order_id,
        )

    if open_positions_same_symbol >= profile.max_positions_per_symbol:
        msg = f"Order blocked: max positions per symbol ({profile.max_positions_per_symbol}) for {symbol}."
        return _block(
            db,
            user_id=user_id,
            event_type="ORDER_BLOCKED_SYMBOL_EXPOSURE",
            severity="danger",
            message=msg,
            paper_account_id=paper_account_id,
            paper_order_id=paper_order_id,
        )

    log_audit_event(
        db,
        user_id=user_id,
        entity_type="paper_order",
        entity_id=None,
        event_type="ORDER_APPROVED_RISK_OK",
        severity="info",
        message=f"Paper order approved for {symbol} {side.value}.",
        metadata={"symbol": symbol, "side": side.value},
    )
    return True, None
