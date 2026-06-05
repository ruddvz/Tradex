"""Emergency bot controls — kill switch (paper only for MVP)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.user import User
from ...services.risk_engine import get_or_create_bot_control, log_audit_event
from ..deps import get_current_user

router = APIRouter(prefix="/bot", tags=["bot"])


class BotStatusOut(BaseModel):
    kill_switch_active: bool
    paper_orders_paused: bool
    live_execution_enabled: bool = False


@router.get("/status", response_model=BotStatusOut)
def bot_status(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = get_or_create_bot_control(db, user.id)
    db.commit()
    return BotStatusOut(
        kill_switch_active=c.kill_switch_active,
        paper_orders_paused=c.paper_orders_paused,
        live_execution_enabled=False,
    )


@router.post("/kill-switch", response_model=BotStatusOut)
def activate_kill_switch(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = get_or_create_bot_control(db, user.id)
    c.kill_switch_active = True
    c.paper_orders_paused = True
    log_audit_event(
        db,
        user_id=user.id,
        entity_type="bot_control",
        entity_id=user.id,
        event_type="KILL_SWITCH_TRIGGERED",
        severity="critical",
        message="Kill switch activated — all new paper orders blocked.",
    )
    db.commit()
    return BotStatusOut(
        kill_switch_active=True,
        paper_orders_paused=True,
        live_execution_enabled=False,
    )


@router.post("/resume-paper-only", response_model=BotStatusOut)
def resume_paper_only(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = get_or_create_bot_control(db, user.id)
    c.kill_switch_active = False
    c.paper_orders_paused = False
    log_audit_event(
        db,
        user_id=user.id,
        entity_type="bot_control",
        entity_id=user.id,
        event_type="KILL_SWITCH_RESET",
        severity="info",
        message="Kill switch cleared — paper orders allowed again.",
    )
    db.commit()
    return BotStatusOut(
        kill_switch_active=False,
        paper_orders_paused=False,
        live_execution_enabled=False,
    )
