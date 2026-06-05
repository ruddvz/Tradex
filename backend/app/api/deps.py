"""FastAPI dependencies — authentication."""

from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.auth_cookies import ACCESS_COOKIE
from ..core.security import decode_token
from ..database import get_db
from ..models.user import User

security = HTTPBearer(auto_error=False)


def _resolve_token(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials],
) -> str | None:
    if credentials and credentials.credentials:
        return credentials.credentials
    cookie_token = request.cookies.get(ACCESS_COOKIE)
    if cookie_token:
        return cookie_token
    return None


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    raw = _resolve_token(request, credentials)
    if not raw:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    user_id = decode_token(raw, expected_type="access")
    if not user_id:
        user_id = decode_token(raw)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user
