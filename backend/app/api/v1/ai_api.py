"""AI insights endpoint."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.user import User
from ...services.ai_service import generate_ai_insights
from ...services.ai_trust import enrich_insights
from ...services.analytics import (
    compute_metrics,
    compute_psychology_stats,
    compute_session_stats,
    compute_symbol_stats,
)
from ..deps import get_current_user
from .api_common import resolve_owned_account_id, user_trade_dicts

router = APIRouter(tags=["ai"])


@router.post("/ai/insights")
async def get_ai_insights(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    account_id: Optional[str] = None,
):
    aid = account_id
    if aid:
        _ = resolve_owned_account_id(db, user, aid)
    ut = user_trade_dicts(db, user.id, aid)
    if not ut:
        return {"insights": []}
    metrics = compute_metrics(ut)
    summary = {
        "symbols": compute_symbol_stats(ut),
        "sessions": compute_session_stats(ut),
        "psychology": compute_psychology_stats(ut),
    }
    insights = await generate_ai_insights(metrics, summary)
    enriched = enrich_insights(
        insights,
        trade_count=int(metrics.get("total_trades", 0)),
        date_range="account journal",
        review_type="behavior_review",
    )
    return {"insights": enriched}
