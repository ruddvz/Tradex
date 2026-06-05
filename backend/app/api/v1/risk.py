"""Risk profiles and audit events API."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.audit_log import AuditLog
from ...models.paper_violation import PaperViolation
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


class PaperViolationOut(BaseModel):
    id: str
    violation_type: str
    reason: str
    severity: str
    paper_account_id: Optional[str] = None
    paper_order_id: Optional[str] = None
    created_at: Optional[str] = None


@router.get("/profiles", response_model=list[RiskProfileOut])
def list_risk_profiles(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_default_risk_profile(db, user.id)
    db.commit()
    rows = (
        db.execute(
            select(RiskProfile)
            .where(RiskProfile.user_id == user.id)
            .order_by(RiskProfile.created_at.asc())
        )
        .scalars()
        .all()
    )
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


@router.get("/profile", response_model=RiskProfileOut)
def get_default_risk_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the user's primary (first) risk profile."""
    profiles = list_risk_profiles(user=user, db=db)
    if not profiles:
        raise HTTPException(status_code=404, detail="Risk profile not found")
    return profiles[0]


@router.get("/violations", response_model=list[PaperViolationOut])
def list_paper_violations(
    limit: int = Query(50, ge=1, le=200),
    paper_account_id: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(PaperViolation).where(PaperViolation.user_id == user.id)
    if paper_account_id:
        q = q.where(PaperViolation.paper_account_id == paper_account_id)
    rows = db.execute(q.order_by(PaperViolation.created_at.desc()).limit(limit)).scalars().all()
    return [
        PaperViolationOut(
            id=r.id,
            violation_type=r.violation_type,
            reason=r.reason,
            severity=r.severity,
            paper_account_id=r.paper_account_id,
            paper_order_id=r.paper_order_id,
            created_at=r.created_at.isoformat() if r.created_at else None,
        )
        for r in rows
    ]


@router.get("/events", response_model=list[AuditEventOut])
def list_risk_events(
    limit: int = Query(50, ge=1, le=200),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.execute(
            select(AuditLog)
            .where(AuditLog.user_id == user.id)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
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


class RiskProfileUpdate(BaseModel):
    name: Optional[str] = None
    max_risk_per_trade_percent: Optional[float] = None
    max_daily_loss_percent: Optional[float] = None
    max_open_positions: Optional[int] = None
    max_positions_per_symbol: Optional[int] = None
    require_stop_loss: Optional[bool] = None


@router.patch("/profiles/{profile_id}", response_model=RiskProfileOut)
def update_risk_profile(
    profile_id: str,
    body: RiskProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.get(RiskProfile, profile_id)
    if not row or row.user_id != user.id:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Risk profile not found")
    if body.name is not None:
        row.name = body.name.strip()
    if body.max_risk_per_trade_percent is not None:
        row.max_risk_per_trade_percent = body.max_risk_per_trade_percent
    if body.max_daily_loss_percent is not None:
        row.max_daily_loss_percent = body.max_daily_loss_percent
    if body.max_open_positions is not None:
        row.max_open_positions = body.max_open_positions
    if body.max_positions_per_symbol is not None:
        row.max_positions_per_symbol = body.max_positions_per_symbol
    if body.require_stop_loss is not None:
        row.require_stop_loss = 1 if body.require_stop_loss else 0
    db.commit()
    db.refresh(row)
    return RiskProfileOut(
        id=row.id,
        name=row.name,
        max_risk_per_trade_percent=row.max_risk_per_trade_percent,
        max_daily_loss_percent=row.max_daily_loss_percent,
        max_open_positions=row.max_open_positions,
        max_positions_per_symbol=row.max_positions_per_symbol,
        require_stop_loss=bool(row.require_stop_loss),
    )
