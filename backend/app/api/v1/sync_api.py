"""MT5 sync endpoint."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...core.config import settings
from ...database import get_db
from ...models.trade import Trade
from ...models.user import User
from ...services.trade_codec import trade_from_mt5_dict
from ..deps import get_current_user
from .api_common import resolve_owned_account_id
from .api_serializers import resolve_mt5_credentials

router = APIRouter(tags=["sync"])


class Mt5SyncIn(BaseModel):
    server: Optional[str] = None
    login: Optional[int] = None
    password: Optional[str] = None
    days: int = Field(default=90, ge=1, le=365)
    account_id: Optional[str] = None


@router.post("/sync/mt5")
async def sync_mt5(
    body: Mt5SyncIn = Body(default_factory=Mt5SyncIn),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.refresh(user)
    login_i, password, server = resolve_mt5_credentials(user, body)

    from ...services.mt5_sync import MT5SyncService

    service = MT5SyncService(login_i, password, server)
    connected = service.connect()
    from_date = datetime.now() - timedelta(days=body.days)
    trade_account_id = resolve_owned_account_id(db, user, body.account_id)
    try:
        if connected:
            fetched = service.fetch_trades(from_date=from_date)
        else:
            fetched = []
    finally:
        service.disconnect()

    used_demo_fallback = False
    if not fetched and not connected:
        if settings.ALLOW_DEMO_MT5_FALLBACK and settings.DEBUG:
            fetched = MT5SyncService.demo_sample_trades()
            used_demo_fallback = True
        else:
            raise HTTPException(
                status_code=503,
                detail=(
                    "MT5 terminal unavailable. No trades imported. "
                    "Use a running MT5 terminal with valid credentials, or set "
                    "DEBUG=true and ALLOW_DEMO_MT5_FALLBACK=true for local demo samples only."
                ),
            )

    if used_demo_fallback:
        import_source = "demo_mt5_sample"
    elif connected:
        import_source = "mt5"
    else:
        import_source = "mt5_demo"

    uid = user.id
    tickets_q = select(Trade.mt5_ticket).where(
        Trade.user_id == uid,
        Trade.account_id == trade_account_id,
        Trade.mt5_ticket.is_not(None),
    )
    existing_tickets = {x for x in db.execute(tickets_q).scalars().all() if x}

    added = 0
    for tr in fetched:
        mt = str(tr.get("mt5_ticket") or tr.get("ticket") or "")
        if mt and mt in existing_tickets:
            continue
        tid = str(uuid.uuid4())
        row = trade_from_mt5_dict(
            uid,
            tid,
            tr,
            source=import_source,
            account_id=trade_account_id,
        )
        db.add(row)
        if mt:
            existing_tickets.add(mt)
        added += 1

    db.commit()

    status = "success" if connected else "demo"
    message = None
    if connected:
        message = None
    elif used_demo_fallback:
        message = "Demo sample import — not live broker data " "(ALLOW_DEMO_MT5_FALLBACK + DEBUG)."
    return {
        "status": status,
        "import_kind": import_source,
        "connected": connected,
        "demo_fallback_used": used_demo_fallback,
        "synced": len(fetched),
        "new": added,
        "message": message,
    }
