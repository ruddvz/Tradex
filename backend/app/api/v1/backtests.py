"""Backtest CRUD, CSV candle upload, and run endpoints."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...core.config import settings
from ...database import get_db
from ...models.backtest import Backtest
from ...models.candle_dataset import CandleDataset
from ...models.import_batch import ImportBatch
from ...models.strategy import Strategy
from ...models.strategy_version import StrategyVersion
from ...models.user import User
from ...services.backtesting import BacktestAssumptions, dumps_json, run_backtest
from ...services.market_data.csv_provider import (
    load_candles_from_csv_bytes,
    load_candles_from_path,
    save_candles_to_path,
)
from ...services.strategy_versions import create_strategy_version, resolve_rules_from_version
from ..deps import get_current_user

router = APIRouter(prefix="/backtests", tags=["backtests"])


class BacktestCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    symbol: str = Field(default="EURUSD", max_length=32)
    strategy_id: Optional[str] = None
    strategy_version_id: Optional[str] = None
    candle_dataset_id: Optional[str] = None
    rules: dict[str, Any] = Field(
        default_factory=lambda: {"lookback": 12, "rr_target": 2.0, "stop_pips": 15}
    )
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
    data_label: Optional[str] = None
    created_at: Optional[str] = None


class BacktestDetail(BacktestSummary):
    metrics: dict[str, Any] = Field(default_factory=dict)
    in_sample_metrics: Optional[dict[str, Any]] = None
    out_of_sample_metrics: Optional[dict[str, Any]] = None
    assumptions: dict[str, Any] = Field(default_factory=dict)
    data_label: str = "synthetic_demo"
    trust_warnings: list[str] = Field(default_factory=list)
    oos_warnings: list[str] = Field(default_factory=list)
    candle_count: Optional[int] = None


class StrategyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    symbol: str = Field(default="EURUSD", max_length=32)
    rules: dict[str, Any] = Field(default_factory=dict)
    change_note: Optional[str] = None


class StrategyOut(BaseModel):
    id: str
    name: str
    symbol: str
    rules: dict[str, Any]
    latest_version_id: Optional[str] = None
    latest_version_number: Optional[int] = None


class StrategyVersionOut(BaseModel):
    id: str
    strategy_id: str
    version_number: int
    name: str
    symbol: str
    rules: dict[str, Any]
    status: str
    change_note: Optional[str] = None


class CandleDatasetOut(BaseModel):
    id: str
    symbol: str
    filename: Optional[str] = None
    candle_count: int
    date_start: Optional[str] = None
    date_end: Optional[str] = None
    created_at: Optional[str] = None


TRUST_WARNINGS = [
    "Backtests are estimates, not guarantees.",
    "Live fills can be worse than simulated fills.",
    "Spread, slippage, commissions, and execution delays can change results.",
    "Do not enable live trading from a backtest alone.",
]


def _parse_json(raw: Optional[str], default: Any) -> Any:
    if not raw:
        return default
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
        data_label=row.data_label or "synthetic_demo",
        created_at=row.created_at.isoformat() if row.created_at else None,
    )


def _detail_from_result(row: Backtest, result: dict[str, Any]) -> BacktestDetail:
    metrics = _parse_json(row.metrics_json, {})
    assumptions = _parse_json(row.assumptions_json, {})
    return BacktestDetail(
        **_summary(row).model_dump(),
        metrics=metrics,
        in_sample_metrics=result.get("in_sample_metrics"),
        out_of_sample_metrics=result.get("out_of_sample_metrics"),
        assumptions=assumptions,
        data_label=result.get("data_label", row.data_label or "synthetic_demo"),
        trust_warnings=TRUST_WARNINGS,
        oos_warnings=result.get("oos_warnings") or [],
        candle_count=result.get("candle_count"),
    )


def _owned_backtest(db: Session, user_id: str, backtest_id: str) -> Backtest:
    row = db.get(Backtest, backtest_id)
    if not row or row.user_id != user_id:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return row


def _load_candles_for_dataset(db: Session, user_id: str, dataset_id: str):
    ds = db.get(CandleDataset, dataset_id)
    if not ds or ds.user_id != user_id:
        raise HTTPException(status_code=404, detail="Candle dataset not found")
    path = Path(ds.storage_path)
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Candle data file missing")
    return load_candles_from_path(path), ds


@router.get("", response_model=list[BacktestSummary])
def list_backtests(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.execute(
            select(Backtest).where(Backtest.user_id == user.id).order_by(Backtest.created_at.desc())
        )
        .scalars()
        .all()
    )
    return [_summary(r) for r in rows]


@router.post("/candle-datasets", response_model=CandleDatasetOut)
async def upload_candle_dataset(
    file: UploadFile = File(...),
    symbol: str = Form(default="EURUSD"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    raw = await file.read()
    if len(raw) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="CSV file too large (max 5MB)")

    try:
        candles = load_candles_from_csv_bytes(raw, symbol=symbol.upper())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    batch_id = str(uuid.uuid4())
    batch = ImportBatch(
        id=batch_id,
        user_id=user.id,
        source="csv_candles",
        status="completed",
        records_seen=len(candles),
        records_inserted=len(candles),
        records_updated=0,
        records_skipped_duplicate=0,
        records_failed=0,
        completed_at=datetime.now(timezone.utc),
        raw_summary_json=json.dumps({"filename": file.filename, "symbol": symbol.upper()}),
    )
    db.add(batch)

    ds_id = str(uuid.uuid4())
    root = Path(settings.UPLOAD_ROOT) / "candles" / user.id
    storage_path = root / f"{ds_id}.json"
    save_candles_to_path(candles, storage_path)

    ds = CandleDataset(
        id=ds_id,
        user_id=user.id,
        import_batch_id=batch_id,
        symbol=symbol.upper(),
        filename=file.filename,
        candle_count=len(candles),
        date_start=candles[0].ts[:10],
        date_end=candles[-1].ts[:10],
        storage_path=str(storage_path),
    )
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return CandleDatasetOut(
        id=ds.id,
        symbol=ds.symbol,
        filename=ds.filename,
        candle_count=ds.candle_count,
        date_start=ds.date_start,
        date_end=ds.date_end,
        created_at=ds.created_at.isoformat() if ds.created_at else None,
    )


@router.get("/candle-datasets", response_model=list[CandleDatasetOut])
def list_candle_datasets(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.execute(
            select(CandleDataset)
            .where(CandleDataset.user_id == user.id)
            .order_by(CandleDataset.created_at.desc())
        )
        .scalars()
        .all()
    )
    return [
        CandleDatasetOut(
            id=r.id,
            symbol=r.symbol,
            filename=r.filename,
            candle_count=r.candle_count,
            date_start=r.date_start,
            date_end=r.date_end,
            created_at=r.created_at.isoformat() if r.created_at else None,
        )
        for r in rows
    ]


@router.post("", response_model=BacktestDetail)
def create_and_run_backtest(
    body: BacktestCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rules = body.rules
    strategy_version_id = body.strategy_version_id

    if body.strategy_id:
        strat = db.get(Strategy, body.strategy_id)
        if not strat or strat.user_id != user.id:
            raise HTTPException(status_code=404, detail="Strategy not found")
        if not strategy_version_id:
            ver = create_strategy_version(db, strategy=strat, status="tested")
            strategy_version_id = ver.id
        try:
            rules, _ = resolve_rules_from_version(
                db,
                user_id=user.id,
                strategy_version_id=strategy_version_id,
                fallback_rules=_parse_json(strat.rules_json, body.rules),
            )
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc

    candles = None
    candle_dataset_id = body.candle_dataset_id
    if candle_dataset_id:
        candles, _ = _load_candles_for_dataset(db, user.id, candle_dataset_id)

    assumptions = BacktestAssumptions(
        spread_pips=body.spread_pips,
        slippage_pips=body.slippage_pips,
        commission_per_lot=body.commission_per_lot,
        lot_size=body.lot_size,
        starting_balance=body.starting_balance,
    )
    result = run_backtest(
        symbol=body.symbol.upper(),
        rules=rules,
        assumptions=assumptions,
        candles=candles,
        data_label="csv_upload" if candles is not None else None,
    )

    bid = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    stored_metrics = {
        **result["metrics"],
        "in_sample_metrics": result.get("in_sample_metrics"),
        "out_of_sample_metrics": result.get("out_of_sample_metrics"),
        "oos_warnings": result.get("oos_warnings") or [],
    }
    row = Backtest(
        id=bid,
        user_id=user.id,
        strategy_id=body.strategy_id,
        strategy_version_id=strategy_version_id,
        candle_dataset_id=candle_dataset_id,
        data_label=result.get("data_label", "synthetic_demo"),
        name=body.name.strip(),
        symbol=body.symbol.upper(),
        status="completed",
        starting_balance=body.starting_balance,
        assumptions_json=dumps_json({**result["assumptions"], "rules": rules}),
        metrics_json=dumps_json(stored_metrics),
        trades_json=dumps_json(result["trades"]),
        equity_curve_json=dumps_json(result["equity_curve"]),
        completed_at=now,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _detail_from_result(row, result)


@router.get("/strategies", response_model=list[StrategyOut])
def list_strategies(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.execute(
            select(Strategy).where(Strategy.user_id == user.id).order_by(Strategy.created_at.desc())
        )
        .scalars()
        .all()
    )
    out: list[StrategyOut] = []
    for r in rows:
        latest = db.execute(
            select(StrategyVersion)
            .where(StrategyVersion.strategy_id == r.id)
            .order_by(StrategyVersion.version_number.desc())
            .limit(1)
        ).scalar_one_or_none()
        out.append(
            StrategyOut(
                id=r.id,
                name=r.name,
                symbol=r.symbol,
                rules=_parse_json(r.rules_json, {}),
                latest_version_id=latest.id if latest else None,
                latest_version_number=latest.version_number if latest else None,
            )
        )
    return out


@router.post("/strategies", response_model=StrategyOut)
def create_strategy(
    body: StrategyCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sid = str(uuid.uuid4())
    row = Strategy(
        id=sid,
        user_id=user.id,
        name=body.name.strip(),
        symbol=body.symbol.upper(),
        rules_json=json.dumps(body.rules),
    )
    db.add(row)
    db.flush()
    ver = create_strategy_version(
        db, strategy=row, change_note=body.change_note or "Initial version", status="draft"
    )
    db.commit()
    return StrategyOut(
        id=sid,
        name=row.name,
        symbol=row.symbol,
        rules=body.rules,
        latest_version_id=ver.id,
        latest_version_number=ver.version_number,
    )


@router.get("/strategies/{strategy_id}/versions", response_model=list[StrategyVersionOut])
def list_strategy_versions(
    strategy_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    strat = db.get(Strategy, strategy_id)
    if not strat or strat.user_id != user.id:
        raise HTTPException(status_code=404, detail="Strategy not found")
    rows = (
        db.execute(
            select(StrategyVersion)
            .where(StrategyVersion.strategy_id == strategy_id)
            .order_by(StrategyVersion.version_number.desc())
        )
        .scalars()
        .all()
    )
    return [
        StrategyVersionOut(
            id=r.id,
            strategy_id=r.strategy_id,
            version_number=r.version_number,
            name=r.name,
            symbol=r.symbol,
            rules=_parse_json(r.rules_json, {}),
            status=r.status,
            change_note=r.change_note,
        )
        for r in rows
    ]


@router.get("/{backtest_id}", response_model=BacktestDetail)
def get_backtest(
    backtest_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _owned_backtest(db, user.id, backtest_id)
    metrics = _parse_json(row.metrics_json, {})
    result = {
        "data_label": row.data_label or "synthetic_demo",
        "in_sample_metrics": metrics.get("in_sample_metrics"),
        "out_of_sample_metrics": metrics.get("out_of_sample_metrics"),
        "oos_warnings": metrics.get("oos_warnings") or [],
        "candle_count": None,
    }
    return _detail_from_result(row, result)


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
