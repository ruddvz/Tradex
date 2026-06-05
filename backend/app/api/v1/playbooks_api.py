"""Playbooks CRUD — persisted strategy playbooks."""

from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.playbook import Playbook
from ...models.user import User
from ...services.playbook_stats import stats_from_trades, trades_for_strategy
from ..deps import get_current_user

router = APIRouter(tags=["playbooks"])


class PlaybookCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    type: str = "strategy"
    description: str = ""
    rules: List[str] = Field(default_factory=list)
    strategy_tag: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class PlaybookUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    type: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[List[str]] = None
    strategy_tag: Optional[str] = None
    tags: Optional[List[str]] = None


def _playbook_dict(db: Session, user_id: str, row: Playbook) -> Dict[str, Any]:
    trades = trades_for_strategy(db, user_id, row.strategy_tag)
    stats = stats_from_trades(trades) if row.strategy_tag else stats_from_trades([])
    rules = row.rules if isinstance(row.rules, list) else []
    tags = row.tags if isinstance(row.tags, list) else []
    created = row.created_at.isoformat() if row.created_at else ""
    updated = row.updated_at.isoformat() if row.updated_at else created
    return {
        "id": row.id,
        "name": row.name,
        "type": row.playbook_type,
        "winRate": stats["win_rate"],
        "trades": stats["trades"],
        "profit": stats["profit"],
        "profitFactor": stats["profit_factor"],
        "avgRR": stats["avg_rr"],
        "description": row.description or "",
        "rules": rules,
        "tags": tags,
        "strategyTag": row.strategy_tag,
        "performance": stats["performance"],
        "createdAt": created[:10] if created else "",
        "updatedAt": updated[:10] if updated else "",
        "source": "api",
    }


@router.get("/playbooks")
def list_playbooks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(Playbook).where(Playbook.user_id == user.id).order_by(Playbook.updated_at.desc())
    ).scalars().all()
    return {"playbooks": [_playbook_dict(db, user.id, r) for r in rows]}


@router.post("/playbooks", status_code=201)
def create_playbook(
    body: PlaybookCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = Playbook(
        id=str(uuid.uuid4()),
        user_id=user.id,
        name=body.name.strip(),
        playbook_type=(body.type or "strategy").strip().lower()[:32],
        description=body.description or "",
        rules=[r.strip() for r in body.rules if r and r.strip()],
        strategy_tag=body.strategy_tag.strip() if body.strategy_tag else None,
        tags=[t.strip() for t in body.tags if t and t.strip()],
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _playbook_dict(db, user.id, row)


@router.patch("/playbooks/{playbook_id}")
def update_playbook(
    playbook_id: str,
    body: PlaybookUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.get(Playbook, playbook_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=404, detail="Playbook not found")
    if body.name is not None:
        row.name = body.name.strip()
    if body.type is not None:
        row.playbook_type = body.type.strip().lower()[:32]
    if body.description is not None:
        row.description = body.description
    if body.rules is not None:
        row.rules = [r.strip() for r in body.rules if r and r.strip()]
    if body.strategy_tag is not None:
        row.strategy_tag = body.strategy_tag.strip() or None
    if body.tags is not None:
        row.tags = [t.strip() for t in body.tags if t and t.strip()]
    db.commit()
    db.refresh(row)
    return _playbook_dict(db, user.id, row)


@router.delete("/playbooks/{playbook_id}", status_code=204)
def delete_playbook(
    playbook_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.get(Playbook, playbook_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=404, detail="Playbook not found")
    db.delete(row)
    db.commit()
    return None
