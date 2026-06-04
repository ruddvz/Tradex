"""Settings and notification endpoints."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ...core.config import settings
from ...core.mt5_crypto import encrypt_mt5_secret
from ...database import get_db
from ...models.user import User
from ...tasks.notifications import merge_notification_prefs, run_daily_report_cycle
from ..deps import get_current_user
from .api_serializers import mt5_settings_public

router = APIRouter(tags=["settings"])


class Mt5SettingsUpdate(BaseModel):
    server: Optional[str] = None
    login: Optional[str] = None
    password: Optional[str] = None


class NotificationsUpdate(BaseModel):
    email: Optional[bool] = None
    push: Optional[bool] = None
    drawdownAlerts: Optional[bool] = None
    dailyReport: Optional[bool] = None


@router.get("/settings/mt5")
def get_mt5_settings(user: User = Depends(get_current_user)):
    return mt5_settings_public(user)


@router.put("/settings/mt5")
def put_mt5_settings(
    body: Mt5SettingsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.server is not None:
        user.mt5_server = body.server.strip() if body.server.strip() else None
    if body.login is not None:
        user.mt5_login = body.login.strip() if body.login.strip() else None
    if body.password is not None:
        if body.password == "":
            user.mt5_password_encrypted = None
        else:
            user.mt5_password_encrypted = encrypt_mt5_secret(body.password)
    db.commit()
    db.refresh(user)
    return mt5_settings_public(user)


@router.get("/settings/notifications")
def get_notification_settings(user: User = Depends(get_current_user)):
    return merge_notification_prefs(user.notification_prefs)


@router.put("/settings/notifications")
def put_notification_settings(
    body: NotificationsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cur = merge_notification_prefs(user.notification_prefs)
    if body.email is not None:
        cur["email"] = body.email
    if body.push is not None:
        cur["push"] = body.push
    if body.drawdownAlerts is not None:
        cur["drawdownAlerts"] = body.drawdownAlerts
    if body.dailyReport is not None:
        cur["dailyReport"] = body.dailyReport
    user.notification_prefs = cur
    db.commit()
    db.refresh(user)
    return merge_notification_prefs(user.notification_prefs)


@router.post("/notifications/send-daily")
def trigger_daily_email_reports(
    db: Session = Depends(get_db),
    x_cron_secret: Optional[str] = Header(None, alias="X-Cron-Secret"),
):
    secret = settings.NOTIFICATIONS_CRON_SECRET
    if secret:
        if x_cron_secret != secret:
            raise HTTPException(status_code=403, detail="Invalid X-Cron-Secret")
    elif not settings.DEBUG:
        raise HTTPException(
            status_code=503,
            detail="NOTIFICATIONS_CRON_SECRET not configured (set env or DEBUG=true for dev-only trigger)",
        )
    return run_daily_report_cycle(db)
