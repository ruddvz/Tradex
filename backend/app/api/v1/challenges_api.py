"""Prop firm challenges API."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.challenge import PropChallenge
from ...models.user import User
from ..deps import get_current_user
from .api_serializers import challenge_to_dict

router = APIRouter(tags=["challenges"])


class PropChallengeIn(BaseModel):
    name: str
    firm: str
    account_size: float
    profit_target: float
    max_drawdown: float
    daily_drawdown: float
    min_trading_days: int = 10
    start_date: str
    end_date: str


@router.get("/challenges")
async def get_challenges(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(PropChallenge)
        .where(PropChallenge.user_id == user.id)
        .order_by(PropChallenge.created_at.desc())
    ).scalars().all()
    return {"challenges": [challenge_to_dict(c) for c in rows]}


@router.post("/challenges", status_code=201)
async def create_challenge(
    challenge: PropChallengeIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = challenge.model_dump()
    row = PropChallenge(
        id=str(uuid.uuid4()),
        user_id=user.id,
        name=data["name"],
        firm=data["firm"],
        account_size=data["account_size"],
        profit_target=data["profit_target"],
        max_drawdown=data["max_drawdown"],
        daily_drawdown=data["daily_drawdown"],
        min_trading_days=data["min_trading_days"],
        start_date=data["start_date"],
        end_date=data["end_date"],
        current_pnl=0,
        current_drawdown=0,
        daily_loss=0,
        status="active",
        trades_count=0,
        days_traded=0,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return challenge_to_dict(row)
