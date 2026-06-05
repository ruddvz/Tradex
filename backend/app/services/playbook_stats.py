"""Compute playbook performance from journal trades."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.trade import Trade


def stats_from_trades(trades: List[Trade]) -> Dict[str, Any]:
    if not trades:
        return {
            "win_rate": 0.0,
            "trades": 0,
            "profit": 0.0,
            "profit_factor": 0.0,
            "avg_rr": 0.0,
            "performance": [],
        }
    wins = [t for t in trades if t.status and t.status.value == "WIN"]
    losses = [t for t in trades if t.status and t.status.value == "LOSS"]
    gross_win = sum(t.pnl or 0 for t in wins)
    gross_loss = abs(sum(t.pnl or 0 for t in losses))
    profit = sum(t.pnl or 0 for t in trades)
    pf = gross_win / gross_loss if gross_loss > 0.01 else (99.0 if gross_win > 0 else 0.0)
    avg_rr = sum(t.r_multiple or 0 for t in trades) / len(trades)
    win_rate = round(len(wins) / len(trades) * 1000) / 10

    cum = 0.0
    performance = []
    for t in sorted(trades, key=lambda x: x.entry_time)[-40:]:
        cum += t.pnl or 0
        performance.append(
            {
                "date": t.entry_time.date().isoformat() if t.entry_time else "",
                "pnl": round(cum, 2),
            }
        )

    return {
        "win_rate": win_rate,
        "trades": len(trades),
        "profit": round(profit, 2),
        "profit_factor": round(min(99.0, pf), 2),
        "avg_rr": round(avg_rr, 2),
        "performance": performance,
    }


def trades_for_strategy(db: Session, user_id: str, strategy_tag: Optional[str]) -> List[Trade]:
    if not strategy_tag:
        return []
    tag = strategy_tag.strip()
    rows = db.execute(select(Trade).where(Trade.user_id == user_id)).scalars().all()
    if tag.lower() == "unlabeled":
        return [t for t in rows if not (t.strategy or "").strip()]
    return [t for t in rows if (t.strategy or "").strip() == tag]
