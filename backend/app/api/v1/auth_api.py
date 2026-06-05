"""Auth and health endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...core.auth_cookies import REFRESH_COOKIE, clear_auth_cookies, set_auth_cookies
from ...core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from ...database import get_db
from ...models.trading_account import TradingAccount, TradingAccountType
from ...models.user import User, UserPlan
from ...services.manual_tasks_seed import ensure_default_manual_tasks
from ...services.risk_engine import ensure_default_risk_profile, get_or_create_bot_control
from ..deps import get_current_user
from .api_serializers import serialize_user

router = APIRouter(tags=["auth"])


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


def _issue_tokens(response: Response, user_id: str) -> TokenResponse:
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access_token=access, refresh_token=refresh)
    return TokenResponse(access_token=access)


@router.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "timestamp": datetime.utcnow().isoformat()}


@router.post("/auth/register", status_code=201)
def register(body: UserRegister, response: Response, db: Session = Depends(get_db)):
    email = body.email.lower().strip()
    existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    uid = str(uuid.uuid4())
    user = User(
        id=uid,
        email=email,
        hashed_password=hash_password(body.password),
        name=body.name.strip(),
        plan=UserPlan.FREE,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    ensure_default_manual_tasks(db, uid)
    ensure_default_risk_profile(db, uid)
    get_or_create_bot_control(db, uid)
    db.commit()

    acc = TradingAccount(
        id=str(uuid.uuid4()),
        user_id=uid,
        name="Primary",
        broker=None,
        account_type=TradingAccountType.DEMO,
        base_currency="USD",
        starting_balance=10000.0,
        current_balance=10000.0,
        current_equity=10000.0,
        risk_per_trade_default=1.0,
        max_daily_loss=None,
        max_total_drawdown=None,
    )
    db.add(acc)
    db.commit()

    return _issue_tokens(response, user.id)


@router.post("/auth/login")
def login(body: UserLogin, response: Response, db: Session = Depends(get_db)):
    email = body.email.lower().strip()
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    return _issue_tokens(response, user.id)


@router.post("/auth/refresh", response_model=TokenResponse)
def refresh_session(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_refresh = request.cookies.get(REFRESH_COOKIE)
    if not raw_refresh:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    user_id = decode_token(raw_refresh, expected_type="refresh")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return _issue_tokens(response, user.id)


@router.post("/auth/logout")
def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


@router.get("/auth/me")
def auth_me(user: User = Depends(get_current_user)):
    return serialize_user(user)
