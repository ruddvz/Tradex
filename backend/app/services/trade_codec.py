"""Serialize trades for API + analytics (plain dicts with string enums and ISO dates)."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from ..models.trade import Trade, TradeDirection, TradeGrade, TradeStatus


def parse_iso_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    v = value.strip().replace("Z", "+00:00")
    dt = datetime.fromisoformat(v)
    return dt.replace(tzinfo=None) if dt.tzinfo else dt


def _enum_str(val: Any) -> Any:
    if val is None:
        return None
    return val.value if hasattr(val, "value") else val


def trade_to_api_dict(t: Trade) -> Dict[str, Any]:
    """Full API shape including analytics-compatible string fields."""
    return {
        "id": t.id,
        "user_id": t.user_id,
        "symbol": t.symbol,
        "direction": _enum_str(t.direction),
        "entry_price": t.entry_price,
        "exit_price": t.exit_price,
        "lot_size": t.lot_size,
        "entry_time": t.entry_time.isoformat() if t.entry_time else None,
        "exit_time": t.exit_time.isoformat() if t.exit_time else None,
        "pnl": t.pnl or 0,
        "pnl_percent": t.pnl_percent or 0,
        "r_multiple": t.r_multiple or 0,
        "commission": t.commission or 0,
        "swap": t.swap or 0,
        "stop_loss": t.stop_loss,
        "take_profit": t.take_profit,
        "risk_reward": t.risk_reward,
        "strategy": t.strategy,
        "session": t.session,
        "setup": t.setup,
        "status": _enum_str(t.status),
        "grade": _enum_str(t.grade),
        "emotion": t.emotion,
        "emotion_score": t.emotion_score or 5,
        "notes": t.notes,
        "tags": t.tags or [],
        "duration": t.duration or 0,
        "broker": t.broker,
        "account_id": t.account_id,
        "screenshot_url": t.screenshot_url,
        "mt5_ticket": t.mt5_ticket,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
    }


def direction_from_str(raw: str) -> TradeDirection:
    u = (raw or "BUY").upper()
    if u not in TradeDirection.__members__:
        raise ValueError(f"Invalid direction: {raw}")
    return TradeDirection[u]


def status_from_str(raw: str) -> TradeStatus:
    u = raw.upper()
    if u not in TradeStatus.__members__:
        return TradeStatus.BREAKEVEN
    return TradeStatus[u]


def grade_from_str(raw: str) -> TradeGrade:
    u = raw.upper()
    if u not in TradeGrade.__members__:
        return TradeGrade.C
    return TradeGrade[u]


def compute_grade_and_rr(pnl: float, status_str: str) -> tuple[str, float]:
    grade = (
        "A"
        if pnl > 300
        else "B"
        if pnl > 100
        else "C"
        if pnl > 0
        else "D"
        if pnl > -100
        else "F"
    )
    rr = abs(pnl) / max(abs(pnl * 0.4), 1)
    r_multiple = round(rr, 2) if status_str == "WIN" else -round(rr * 0.5, 2)
    return grade, r_multiple


def trade_from_mt5_dict(user_id: str, trade_id: str, d: Dict[str, Any]) -> Trade:
    """Map MT5 sync service dict + demo payloads into a Trade row."""
    pnl = float(d.get("pnl") or 0)
    status_str = d.get("status") or ("WIN" if pnl > 0 else "LOSS" if pnl < 0 else "BREAKEVEN")
    grade_s, r_mult = compute_grade_and_rr(pnl, status_str)
    entry_time = parse_iso_datetime(d["entry_time"])
    if not entry_time:
        entry_time = datetime.utcnow()
    exit_time = parse_iso_datetime(d.get("exit_time"))
    mt5_ticket = str(d.get("mt5_ticket") or d.get("ticket") or "") or None

    return Trade(
        id=trade_id,
        user_id=user_id,
        symbol=str(d.get("symbol") or "UNKNOWN"),
        direction=direction_from_str(str(d.get("direction") or "BUY")),
        entry_price=float(d.get("entry_price") or 0),
        exit_price=float(d["exit_price"]) if d.get("exit_price") is not None else None,
        lot_size=float(d.get("lot_size") or 0),
        entry_time=entry_time,
        exit_time=exit_time,
        pnl=pnl,
        commission=float(d.get("commission") or 0),
        swap=float(d.get("swap") or 0),
        stop_loss=d.get("stop_loss"),
        take_profit=d.get("take_profit"),
        strategy=d.get("strategy"),
        session=d.get("session"),
        emotion=d.get("emotion") or "Neutral",
        emotion_score=int(d.get("emotion_score") or 5),
        notes=d.get("notes"),
        tags=d.get("tags") or [],
        duration=int(d.get("duration") or 0),
        broker=d.get("broker"),
        status=status_from_str(status_str),
        grade=grade_from_str(grade_s),
        r_multiple=r_mult,
        mt5_ticket=mt5_ticket,
    )

