"""Minimal paper trading: balance updates and basic risk gates."""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional, Tuple

from sqlalchemy import select, func as sql_func
from sqlalchemy.orm import Session

from ..models.paper import PaperAccount, PaperTrade, PaperOrderDirection


def _risk_dollars_at_sl(
    direction: PaperOrderDirection,
    entry: float,
    stop_loss: Optional[float],
    lot_size: float,
) -> float:
    """Rough notional risk at SL (per-unit scale; adequate for MVP gating)."""
    if stop_loss is None or stop_loss <= 0:
        return float("inf")
    dist = abs(entry - stop_loss)
    if dist <= 0:
        return float("inf")
    unit = 100.0  # coarse $ / (price point × lot) for journal-style sizing
    return dist * lot_size * unit


def _today_pnl(db: Session, paper_account_id: str) -> float:
    today = date.today()
    start = datetime(today.year, today.month, today.day)
    end = datetime.combine(today, datetime.max.time())
    q = select(sql_func.coalesce(sql_func.sum(PaperTrade.pnl), 0.0)).where(
        PaperTrade.paper_account_id == paper_account_id,
        PaperTrade.exit_time >= start,
        PaperTrade.exit_time <= end,
    )
    return float(db.execute(q).scalar() or 0.0)



def place_paper_trade(
    db: Session,
    *,
    paper_account: PaperAccount,
    symbol: str,
    direction: PaperOrderDirection,
    lot_size: float,
    entry_price: float,
    exit_price: float,
    stop_loss: Optional[float],
    take_profit: Optional[float],
    entry_time: datetime,
    exit_time: datetime,
    notes: Optional[str] = None,
) -> Tuple[Optional[PaperTrade], Optional[str]]:
    """
    Record a closed simulated trade and update balances.
    Returns (trade, error_message).
    """
    if lot_size <= 0:
        return None, "Lot size must be positive."
    if entry_price <= 0 or exit_price <= 0:
        return None, "Prices must be positive."

    risk = _risk_dollars_at_sl(direction, entry_price, stop_loss, lot_size)
    max_risk = paper_account.balance * (paper_account.max_risk_per_trade_percent / 100.0)
    if risk > max_risk:
        return None, (
            f"Blocked: risk at stop is about ${risk:.0f}, "
            f"but account max is {paper_account.max_risk_per_trade_percent:.1f}% of balance "
            f"(${max_risk:.0f})."
        )

    # Directional P&L (same rough scaling as risk)
    unit = 100.0
    if direction == PaperOrderDirection.BUY:
        pnl = (exit_price - entry_price) * lot_size * unit
    else:
        pnl = (entry_price - exit_price) * lot_size * unit

    today_pnl = _today_pnl(db, paper_account.id)
    if today_pnl <= -paper_account.max_daily_loss and pnl < 0:
        return None, "Blocked: daily loss limit already reached; no new losing trades today."

    if today_pnl + pnl < -paper_account.max_daily_loss:
        return None, (
            f"Blocked: this trade would exceed daily loss cap "
            f"(${paper_account.max_daily_loss:.0f})."
        )

    duration = int((exit_time - entry_time).total_seconds() / 60)
    import uuid

    tid = str(uuid.uuid4())
    row = PaperTrade(
        id=tid,
        paper_account_id=paper_account.id,
        symbol=symbol.upper(),
        direction=direction,
        lot_size=lot_size,
        entry_price=entry_price,
        exit_price=exit_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
        entry_time=entry_time,
        exit_time=exit_time,
        pnl=pnl,
        duration_minutes=max(0, duration),
        notes=notes,
    )
    paper_account.balance = round(paper_account.balance + pnl, 2)
    paper_account.equity = paper_account.balance
    db.add(row)
    db.commit()
    db.refresh(row)
    return row, None
