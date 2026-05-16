"""Paper trading accounts API (MVP: list + create)."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.paper_account import PaperAccount
from ...models.user import User
from ...schemas.paper_account import PaperAccountCreate, PaperAccountOut
from ..deps import get_current_user

router = APIRouter()


def _out(row: PaperAccount) -> PaperAccountOut:
    return PaperAccountOut.model_validate(row)


@router.get("", response_model=list[PaperAccountOut])
def list_paper_accounts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(PaperAccount)
        .where(PaperAccount.user_id == user.id)
        .order_by(PaperAccount.created_at.desc())
    ).scalars().all()
    return [_out(r) for r in rows]


@router.post("", response_model=PaperAccountOut, status_code=201)
def create_paper_account(
    body: PaperAccountCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = PaperAccount(
        id=str(uuid.uuid4()),
        user_id=user.id,
        name=body.name.strip(),
        currency=body.currency.strip().upper()[:8] or "USD",
        starting_balance=body.starting_balance,
        is_active=body.is_active,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _out(row)
