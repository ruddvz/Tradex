"""Paper order → fill → position → journal trade lifecycle."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional, Tuple

from sqlalchemy import func as sql_func
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.paper_account import PaperAccount
from ..models.paper_fill import PaperFill
from ..models.paper_order import (
    PaperOrder,
    PaperOrderSide,
    PaperOrderStatus,
    PaperOrderType,
)
from ..models.paper_position import PaperPosition, PaperPositionStatus
from ..models.trade import Trade, TradeDirection
from .fill_assumptions import assumptions_from_account
from .fill_simulator import simulate_market_fill
from .paper_equity import refresh_paper_account_equity, unrealized_pnl_for_position
from .risk_engine import evaluate_paper_order as evaluate_risk_engine
from .risk_engine import log_paper_violation
from .trade_codec import compute_grade_and_rr, grade_from_str, status_from_str

# Coarse $ / (price point × lot) — matches paper_service MVP scaling
_PNL_UNIT = 100.0


def _risk_dollars_at_sl(
    side: PaperOrderSide,
    entry: float,
    stop_loss: Optional[float],
    lot_size: float,
) -> float:
    if stop_loss is None or stop_loss <= 0:
        return float("inf")
    dist = abs(entry - stop_loss)
    if dist <= 0:
        return float("inf")
    return dist * lot_size * _PNL_UNIT


def _today_realized_pnl(db: Session, paper_account_id: str) -> float:
    today = date.today()
    start = datetime(today.year, today.month, today.day)
    end = datetime.combine(today, datetime.max.time())
    q = select(sql_func.coalesce(sql_func.sum(PaperPosition.realized_pnl), 0.0)).where(
        PaperPosition.paper_account_id == paper_account_id,
        PaperPosition.status == PaperPositionStatus.CLOSED,
        PaperPosition.closed_at >= start,
        PaperPosition.closed_at <= end,
    )
    return float(db.execute(q).scalar() or 0.0)


def _pnl_for_close(side: PaperOrderSide, entry: float, exit_price: float, lot_size: float) -> float:
    if side == PaperOrderSide.BUY:
        return (exit_price - entry) * lot_size * _PNL_UNIT
    return (entry - exit_price) * lot_size * _PNL_UNIT


def evaluate_paper_order_risk(
    account: PaperAccount,
    *,
    user_id: str,
    symbol: str,
    side: PaperOrderSide,
    entry_price: float,
    stop_loss: Optional[float],
    lot_size: float,
    db: Session,
) -> Optional[str]:
    if lot_size <= 0:
        return "Lot size must be positive."
    if entry_price <= 0:
        return "Price must be positive."

    risk = _risk_dollars_at_sl(side, entry_price, stop_loss, lot_size)

    open_count = int(
        db.execute(
            select(sql_func.count())
            .select_from(PaperPosition)
            .where(
                PaperPosition.paper_account_id == account.id,
                PaperPosition.status == PaperPositionStatus.OPEN,
            )
        ).scalar()
        or 0
    )

    same_sym = int(
        db.execute(
            select(sql_func.count())
            .select_from(PaperPosition)
            .where(
                PaperPosition.paper_account_id == account.id,
                PaperPosition.status == PaperPositionStatus.OPEN,
                PaperPosition.symbol == symbol.upper(),
            )
        ).scalar()
        or 0
    )

    today_pnl = _today_realized_pnl(db, account.id)
    if today_pnl <= -account.max_daily_loss:
        msg = "Order blocked: daily loss limit already reached."
        log_paper_violation(
            db,
            user_id=user_id,
            violation_type="ORDER_BLOCKED_DAILY_LOSS_LIMIT",
            reason=msg,
            severity="critical",
            paper_account_id=account.id,
        )
        return msg

    approved, reason = evaluate_risk_engine(
        db,
        user_id=user_id,
        symbol=symbol.upper(),
        side=side,
        lot_size=lot_size,
        entry_price=entry_price,
        stop_loss=stop_loss,
        account_balance=account.balance,
        open_positions_count=open_count,
        open_positions_same_symbol=same_sym,
        risk_at_stop_dollars=risk,
        paper_account_id=account.id,
    )
    if not approved:
        return reason
    return None


def submit_paper_market_order(
    db: Session,
    *,
    user_id: str,
    account: PaperAccount,
    symbol: str,
    side: PaperOrderSide,
    lot_size: float,
    reference_price: float,
    stop_loss: Optional[float],
    take_profit: Optional[float],
) -> Tuple[Optional[PaperOrder], Optional[PaperPosition], Optional[str]]:
    err = evaluate_paper_order_risk(
        account,
        user_id=user_id,
        symbol=symbol,
        side=side,
        entry_price=reference_price,
        stop_loss=stop_loss,
        lot_size=lot_size,
        db=db,
    )
    now = datetime.utcnow()
    order_id = str(uuid.uuid4())
    fill_cfg = assumptions_from_account(account)

    order = PaperOrder(
        id=order_id,
        user_id=user_id,
        paper_account_id=account.id,
        symbol=symbol.upper(),
        side=side,
        order_type=PaperOrderType.MARKET,
        status=PaperOrderStatus.SUBMITTED,
        requested_price=reference_price,
        lot_size=lot_size,
        stop_loss=stop_loss,
        take_profit=take_profit,
        submitted_at=now,
    )
    db.add(order)
    db.flush()

    if err:
        order.status = PaperOrderStatus.REJECTED
        order.rejection_reason = err
        log_paper_violation(
            db,
            user_id=user_id,
            violation_type="ORDER_REJECTED",
            reason=err,
            severity="danger",
            paper_account_id=account.id,
            paper_order_id=order.id,
        )
        db.commit()
        db.refresh(order)
        return order, None, err

    order.status = PaperOrderStatus.ACCEPTED
    db.flush()

    quote = simulate_market_fill(
        symbol=symbol,
        side=side.value,
        reference_price=reference_price,
        lot_size=lot_size,
        spread_multiplier=fill_cfg.spread_multiplier,
        slippage_factor=fill_cfg.slippage_factor,
        commission_per_lot=fill_cfg.commission_per_lot,
    )
    position_id = str(uuid.uuid4())
    fill_id = str(uuid.uuid4())

    order.status = PaperOrderStatus.FILLED
    order.filled_avg_price = quote.fill_price
    order.filled_at = now
    position = PaperPosition(
        id=position_id,
        user_id=user_id,
        paper_account_id=account.id,
        symbol=symbol.upper(),
        side=side,
        lot_size=lot_size,
        avg_entry_price=quote.fill_price,
        current_price=quote.fill_price,
        unrealized_pnl=0.0,
        realized_pnl=0.0,
        stop_loss=stop_loss,
        take_profit=take_profit,
        status=PaperPositionStatus.OPEN,
        opened_at=now,
    )
    fill = PaperFill(
        id=fill_id,
        user_id=user_id,
        paper_order_id=order_id,
        paper_position_id=position_id,
        symbol=symbol.upper(),
        side=side,
        quantity=lot_size,
        price=quote.fill_price,
        slippage=quote.slippage,
        spread=quote.spread,
        commission=quote.commission,
        filled_at=now,
    )

    position.unrealized_pnl = unrealized_pnl_for_position(position)
    db.add(position)
    db.add(fill)
    refresh_paper_account_equity(db, account)
    db.commit()
    db.refresh(order)
    db.refresh(position)
    return order, position, None


def close_paper_position(
    db: Session,
    *,
    user_id: str,
    account: PaperAccount,
    position: PaperPosition,
    exit_price: float,
) -> Tuple[Optional[Trade], Optional[str]]:
    if position.status != PaperPositionStatus.OPEN:
        return None, "Position is already closed."

    fill_cfg = assumptions_from_account(account)
    quote = simulate_market_fill(
        symbol=position.symbol,
        side="sell" if position.side == PaperOrderSide.BUY else "buy",
        reference_price=exit_price,
        lot_size=position.lot_size,
        spread_multiplier=fill_cfg.spread_multiplier,
        slippage_factor=fill_cfg.slippage_factor,
        commission_per_lot=fill_cfg.commission_per_lot,
    )
    gross = _pnl_for_close(
        position.side, position.avg_entry_price, quote.fill_price, position.lot_size
    )
    net = round(gross - quote.commission, 2)

    now = datetime.utcnow()
    position.status = PaperPositionStatus.CLOSED
    position.current_price = quote.fill_price
    position.realized_pnl = net
    position.unrealized_pnl = 0.0
    position.closed_at = now

    account.balance = round(account.balance + net, 2)
    refresh_paper_account_equity(db, account)

    status_str = "WIN" if net > 0 else "LOSS" if net < 0 else "BREAKEVEN"
    grade_s, r_mult = compute_grade_and_rr(net, status_str)

    trade = Trade(
        id=str(uuid.uuid4()),
        user_id=user_id,
        account_id=None,
        symbol=position.symbol,
        direction=(
            TradeDirection.BUY if position.side == PaperOrderSide.BUY else TradeDirection.SELL
        ),
        entry_price=position.avg_entry_price,
        exit_price=quote.fill_price,
        lot_size=position.lot_size,
        entry_time=position.opened_at or now,
        exit_time=now,
        pnl=net,
        commission=quote.commission,
        stop_loss=position.stop_loss,
        take_profit=position.take_profit,
        status=status_from_str(status_str),
        grade=grade_from_str(grade_s),
        r_multiple=r_mult,
        duration=int((now - (position.opened_at or now)).total_seconds() / 60),
        notes=f"Paper position {position.id}",
        source="paper",
    )
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade, None


def cancel_paper_order(
    db: Session,
    *,
    user_id: str,
    order: PaperOrder,
) -> Optional[str]:
    """Cancel a non-terminal order. Returns error message or None on success."""
    terminal = {
        PaperOrderStatus.FILLED,
        PaperOrderStatus.REJECTED,
        PaperOrderStatus.CANCELLED,
        PaperOrderStatus.EXPIRED,
    }
    if order.status in terminal:
        return f"Cannot cancel order in status {order.status.value}."
    order.status = PaperOrderStatus.CANCELLED
    order.cancelled_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return None
