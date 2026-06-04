"""Risk profiles and audit events API."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.audit_log import AuditLog
from ...models.risk_profile import RiskProfile
from ...models.user import User
from ...services.risk_engine import ensure_default_risk_profile
from ..deps import get_current_user

router = APIRouter(prefix="/risk", tags=["risk"])


class RiskProfileOut(BaseModel):
    id: str
    name: str
    max_risk_per_trade_percent: float
    max_daily_loss_percent: float
    max_open_positions: int
    max_positions_per_symbol: int
    require_stop_loss: bool


class AuditEventOut(BaseModel):
    id: str
    event_type: str
    severity: str
    message: str
    entity_type: str
    entity_id: Optional[str] = None
    created_at: Optional[str] = None


@router.get("/profiles", response_model=list[RiskProfileOut])
def list_risk_profiles(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_default_risk_profile(db, user.id)
    db.commit()
    rows = db.execute(
        select(RiskProfile).where(RiskProfile.user_id == user.id).order_by(RiskProfile.created_at.asc())
    ).scalars().all()
    return [
        RiskProfileOut(
            id=r.id,
            name=r.name,
            max_risk_per_trade_percent=r.max_risk_per_trade_percent,
            max_daily_loss_percent=r.max_daily_loss_percent,
            max_open_positions=r.max_open_positions,
            max_positions_per_symbol=r.max_positions_per_symbol,
            require_stop_loss=bool(r.require_stop_loss),
        )
        for r in rows
    ]


@router.get("/events", response_model=list[AuditEventOut])
def list_risk_events(
    limit: int = Query(50, ge=1, le=200),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
    ).scalars().all()
    return [
        AuditEventOut(
            id=r.id,
            event_type=r.event_type,
            severity=r.severity,
            message=r.message,
            entity_type=r.entity_type,
            entity_id=r.entity_id,
            created_at=r.created_at.isoformat() if r.created_at else None,
        )
        for r in rows
    ]
