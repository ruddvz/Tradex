"""Setup / health diagnostics."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.user import User
from ...services.setup_health import compute_setup_health
from ..deps import get_current_user

router = APIRouter()


@router.get("/health")
def get_setup_health(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Per-user setup health (DB, Redis, optional services, MT5 saved state)."""
    return compute_setup_health(db, user)
