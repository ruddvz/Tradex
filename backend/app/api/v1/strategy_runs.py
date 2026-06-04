"""Strategy run control — paper mode only."""

from __future__ import annotations

import json
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.audit_log import AuditLog
from ...models.strategy_run import StrategyRun
from ...models.user import User
from ...services.strategy_runner import (
    pause_strategy_run,
    start_strategy_run,
    stop_strategy_run,
    tick_strategy_run,
)
from ..deps import get_current_user

router = APIRouter(prefix="/strategy-runs", tags=["strategy-runs"])


class StrategyRunStart(BaseModel):
    strategy_id: str = Field(min_length=8)
    paper_account_id: str = Field(min_length=8)


class StrategyRunOut(BaseModel):
    id: str
    strategy_id: Optional[str] = None
    paper_account_id: str
    mode: str
    status: str
    started_at: Optional[str] = None
    stopped_at: Optional[str] = None
    config: dict[str, Any] = Field(default_factory=dict)
    summary: dict[str, Any] = Field(default_factory=dict)


class StrategyEventOut(BaseModel):
    id: str
    event_type: str
    severity: str
    message: str
    created_at: Optional[str] = None


def _run_out(r: StrategyRun) -> StrategyRunOut:
    config: dict[str, Any] = {}
    summary: dict[str, Any] = {}
    if r.config_snapshot_json:
        try:
            config = json.loads(r.config_snapshot_json)
        except json.JSONDecodeError:
            pass
    if r.result_summary_json:
        try:
            summary = json.loads(r.result_summary_json)
        except json.JSONDecodeError:
            pass
    return StrategyRunOut(
        id=r.id,
        strategy_id=r.strategy_id,
        paper_account_id=r.paper_account_id,
        mode=r.mode,
        status=r.status,
        started_at=r.started_at.isoformat() if r.started_at else None,
        stopped_at=r.stopped_at.isoformat() if r.stopped_at else None,
        config=config,
        summary=summary,
    )


@router.get("", response_model=list[StrategyRunOut])
def list_strategy_runs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(StrategyRun).where(StrategyRun.user_id == user.id).order_by(StrategyRun.started_at.desc())
    ).scalars().all()
    return [_run_out(r) for r in rows]


@router.post("", response_model=StrategyRunOut)
def create_strategy_run(
    body: StrategyRunStart,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        run = start_strategy_run(
            db,
            user_id=user.id,
            strategy_id=body.strategy_id,
            paper_account_id=body.paper_account_id,
        )
        db.commit()
        db.refresh(run)
        return _run_out(run)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/{run_id}", response_model=StrategyRunOut)
def get_strategy_run(
    run_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.get(StrategyRun, run_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=404, detail="Strategy run not found")
    return _run_out(row)


@router.post("/{run_id}/tick")
def strategy_run_tick(
    run_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return tick_strategy_run(db, user_id=user.id, run_id=run_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.post("/{run_id}/pause", response_model=StrategyRunOut)
def strategy_run_pause(
    run_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        run = pause_strategy_run(db, user_id=user.id, run_id=run_id)
        db.commit()
        db.refresh(run)
        return _run_out(run)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/{run_id}/stop", response_model=StrategyRunOut)
def strategy_run_stop(
    run_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        run = stop_strategy_run(db, user_id=user.id, run_id=run_id)
        db.commit()
        db.refresh(run)
        return _run_out(run)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/{run_id}/events", response_model=list[StrategyEventOut])
def strategy_run_events(
    run_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.get(StrategyRun, run_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=404, detail="Strategy run not found")
    logs = db.execute(
        select(AuditLog)
        .where(
            AuditLog.user_id == user.id,
            AuditLog.entity_type == "strategy_run",
            AuditLog.entity_id == run_id,
        )
        .order_by(AuditLog.created_at.desc())
        .limit(100)
    ).scalars().all()
    return [
        StrategyEventOut(
            id=r.id,
            event_type=r.event_type,
            severity=r.severity,
            message=r.message,
            created_at=r.created_at.isoformat() if r.created_at else None,
        )
        for r in logs
    ]
