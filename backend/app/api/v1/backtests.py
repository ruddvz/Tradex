"""Backtest CRUD and run endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.backtest import Backtest
from ...models.strategy import Strategy
from ...models.user import User
from ...services.backtesting import BacktestAssumptions, dumps_json, run_backtest
from ..deps import get_current_user

router = APIRouter(prefix="/backtests", tags=["backtests"])


class BacktestCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    symbol: str = Field(default="EURUSD", max_length=32)
    strategy_id: Optional[str] = None
    rules: dict[str, Any] = Field(default_factory=lambda: {"lookback": 12, "rr_target": 2.0, "stop_pips": 15})
    spread_pips: float = Field(default=1.2, ge=0)
    slippage_pips: float = Field(default=0.5, ge=0)
    commission_per_lot: float = Field(default=7.0, ge=0)
    lot_size: float = Field(default=0.1, gt=0)
    starting_balance: float = Field(default=100_000.0, gt=0)


class BacktestSummary(BaseModel):
    id: str
    name: str
    symbol: str
    status: str
    net_pnl: Optional[float] = None
    return_pct: Optional[float] = None
    trade_count: Optional[int] = None
    created_at: Optional[str] = None


class BacktestDetail(BacktestSummary):
    metrics: dict[str, Any] = Field(default_factory=dict)
    assumptions: dict[str, Any] = Field(default_factory=dict)
    data_label: str = "synthetic_demo"
    trust_warnings: list[str] = Field(default_factory=list)


class StrategyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    symbol: str = Field(default="EURUSD", max_length=32)
    rules: dict[str, Any] = Field(default_factory=dict)


class StrategyOut(BaseModel):
    id: str
    name: str
    symbol: str
    rules: dict[str, Any]


TRUST_WARNINGS = [
    "Backtests are estimates, not guarantees.",
    "Live fills can be worse than simulated fills.",
    "Spread, slippage, commissions, and execution delays can change results.",
    "Do not enable live trading from a backtest alone.",
]


def _parse_json(raw: Optional[str], default: Any) -> Any:
    if not raw:
        return default
    import json

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return default


def _summary(row: Backtest) -> BacktestSummary:
    metrics = _parse_json(row.metrics_json, {})
    return BacktestSummary(
        id=row.id,
        name=row.name,
        symbol=row.symbol,
        status=row.status,
        net_pnl=metrics.get("net_pnl"),
        return_pct=metrics.get("return_pct"),
        trade_count=metrics.get("trade_count"),
        created_at=row.created_at.isoformat() if row.created_at else None,
    )


def _owned_backtest(db: Session, user_id: str, backtest_id: str) -> Backtest:
    row = db.get(Backtest, backtest_id)
    if not row or row.user_id != user_id:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return row


@router.get("", response_model=list[BacktestSummary])
def list_backtests(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(Backtest).where(Backtest.user_id == user.id).order_by(Backtest.created_at.desc())
    ).scalars().all()
    return [_summary(r) for r in rows]


@router.post("", response_model=BacktestDetail)
def create_and_run_backtest(
    body: BacktestCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rules = body.rules
    if body.strategy_id:
        strat = db.get(Strategy, body.strategy_id)
        if not strat or strat.user_id != user.id:
            raise HTTPException(status_code=404, detail="Strategy not found")
        rules = _parse_json(strat.rules_json, body.rules)

    assumptions = BacktestAssumptions(
        spread_pips=body.spread_pips,
        slippage_pips=body.slippage_pips,
        commission_per_lot=body.commission_per_lot,
        lot_size=body.lot_size,
        starting_balance=body.starting_balance,
    )
    result = run_backtest(symbol=body.symbol.upper(), rules=rules, assumptions=assumptions)

    bid = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    row = Backtest(
        id=bid,
        user_id=user.id,
        strategy_id=body.strategy_id,
        name=body.name.strip(),
        symbol=body.symbol.upper(),
        status="completed",
        starting_balance=body.starting_balance,
        assumptions_json=dumps_json({**result["assumptions"], "rules": rules}),
        metrics_json=dumps_json(result["metrics"]),
        trades_json=dumps_json(result["trades"]),
        equity_curve_json=dumps_json(result["equity_curve"]),
        completed_at=now,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    metrics = result["metrics"]
    return BacktestDetail(
        **_summary(row).model_dump(),
        metrics=metrics,
        assumptions=_parse_json(row.assumptions_json, {}),
        data_label=result.get("data_label", "synthetic_demo"),
        trust_warnings=TRUST_WARNINGS,
    )




@router.get("/strategies", response_model=list[StrategyOut])
def list_strategies(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(Strategy).where(Strategy.user_id == user.id).order_by(Strategy.created_at.desc())
    ).scalars().all()
    return [
        StrategyOut(
            id=r.id,
            name=r.name,
            symbol=r.symbol,
            rules=_parse_json(r.rules_json, {}),
        )
        for r in rows
    ]


@router.post("/strategies", response_model=StrategyOut)
def create_strategy(
    body: StrategyCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json

    sid = str(uuid.uuid4())
    row = Strategy(
        id=sid,
        user_id=user.id,
        name=body.name.strip(),
        symbol=body.symbol.upper(),
        rules_json=json.dumps(body.rules),
    )
    db.add(row)
    db.commit()
    return StrategyOut(id=sid, name=row.name, symbol=row.symbol, rules=body.rules)


@router.get("/{backtest_id}", response_model=BacktestDetail)
def get_backtest(
    backtest_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _owned_backtest(db, user.id, backtest_id)
    metrics = _parse_json(row.metrics_json, {})
    return BacktestDetail(
        **_summary(row).model_dump(),
        metrics=metrics,
        assumptions=_parse_json(row.assumptions_json, {}),
        data_label="synthetic_demo",
        trust_warnings=TRUST_WARNINGS,
    )


@router.get("/{backtest_id}/trades")
def get_backtest_trades(
    backtest_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _owned_backtest(db, user.id, backtest_id)
    return _parse_json(row.trades_json, [])


@router.get("/{backtest_id}/equity-curve")
def get_backtest_equity_curve(
    backtest_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _owned_backtest(db, user.id, backtest_id)
    return _parse_json(row.equity_curve_json, [])


@router.delete("/{backtest_id}")
def delete_backtest(
    backtest_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _owned_backtest(db, user.id, backtest_id)
    db.delete(row)
    db.commit()
    return {"ok": True}
