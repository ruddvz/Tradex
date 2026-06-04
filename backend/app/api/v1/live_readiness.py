"""Live execution readiness checklist (no live orders)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.user import User
from ...services.live_readiness import compute_live_readiness
from ..deps import get_current_user

router = APIRouter(prefix="/live-readiness", tags=["live-readiness"])


@router.get("")
def get_live_readiness(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return compute_live_readiness(db, user.id)
