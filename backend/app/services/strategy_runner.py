"""Run saved strategies in paper mode only — orders go through risk engine."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import func as sql_func
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.paper_account import PaperAccount
from ..models.paper_order import PaperOrderSide
from ..models.paper_position import PaperPosition, PaperPositionStatus
from ..models.strategy import Strategy
from ..models.strategy_run import StrategyRun
from .backtesting import generate_demo_candles
from .paper_execution import submit_paper_market_order
from .risk_engine import log_audit_event


def _parse_json(raw: Optional[str], default: Any) -> Any:
    if not raw:
        return default
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return default


def _summary(run: StrategyRun) -> dict[str, Any]:
    return _parse_json(
        run.result_summary_json,
        {"ticks": 0, "orders_submitted": 0, "orders_filled": 0, "orders_rejected": 0},
    )


def _save_summary(db: Session, run: StrategyRun, summary: dict[str, Any]) -> None:
    run.result_summary_json = json.dumps(summary, separators=(",", ":"))


def start_strategy_run(
    db: Session,
    *,
    user_id: str,
    strategy_id: str,
    paper_account_id: str,
) -> StrategyRun:
    strat = db.get(Strategy, strategy_id)
    if not strat or strat.user_id != user_id:
        raise ValueError("Strategy not found")

    ac = db.execute(
        select(PaperAccount).where(
            PaperAccount.id == paper_account_id,
            PaperAccount.user_id == user_id,
        )
    ).scalar_one_or_none()
    if ac is None:
        raise ValueError("Paper account not found")

    existing = db.execute(
        select(StrategyRun).where(
            StrategyRun.user_id == user_id,
            StrategyRun.paper_account_id == paper_account_id,
            StrategyRun.status == "running",
        )
    ).scalar_one_or_none()
    if existing:
        raise ValueError("A strategy is already running on this paper account.")

    rules = _parse_json(strat.rules_json, {})
    run = StrategyRun(
        id=str(uuid.uuid4()),
        user_id=user_id,
        strategy_id=strategy_id,
        paper_account_id=paper_account_id,
        mode="paper",
        status="running",
        config_snapshot_json=json.dumps(
            {
                "strategy_name": strat.name,
                "symbol": strat.symbol,
                "rules": rules,
            }
        ),
        result_summary_json=json.dumps(
            {"ticks": 0, "orders_submitted": 0, "orders_filled": 0, "orders_rejected": 0}
        ),
    )
    db.add(run)
    log_audit_event(
        db,
        user_id=user_id,
        entity_type="strategy_run",
        entity_id=run.id,
        event_type="STRATEGY_RUN_STARTED",
        severity="info",
        message=f"Paper strategy run started: {strat.name}",
        metadata={"strategy_id": strategy_id, "paper_account_id": paper_account_id},
    )
    db.flush()
    return run


def pause_strategy_run(db: Session, *, user_id: str, run_id: str) -> StrategyRun:
    run = _get_run(db, user_id, run_id)
    if run.status != "running":
        raise ValueError("Run is not active.")
    run.status = "paused"
    log_audit_event(
        db,
        user_id=user_id,
        entity_type="strategy_run",
        entity_id=run.id,
        event_type="STRATEGY_RUN_PAUSED",
        severity="info",
        message="Strategy run paused.",
    )
    return run


def stop_strategy_run(db: Session, *, user_id: str, run_id: str) -> StrategyRun:
    run = _get_run(db, user_id, run_id)
    if run.status in ("stopped", "completed"):
        return run
    run.status = "stopped"
    run.stopped_at = datetime.now(timezone.utc)
    log_audit_event(
        db,
        user_id=user_id,
        entity_type="strategy_run",
        entity_id=run.id,
        event_type="STRATEGY_RUN_STOPPED",
        severity="info",
        message="Strategy run stopped.",
    )
    return run


def _get_run(db: Session, user_id: str, run_id: str) -> StrategyRun:
    run = db.get(StrategyRun, run_id)
    if not run or run.user_id != user_id:
        raise ValueError("Strategy run not found")
    return run


def tick_strategy_run(db: Session, *, user_id: str, run_id: str) -> dict[str, Any]:
    """Manual tick: at most one paper order per tick, routed through risk + fill simulator."""
    run = _get_run(db, user_id, run_id)
    if run.status != "running":
        return {"action": "skipped", "reason": f"Run status is {run.status}"}
    if run.mode != "paper":
        return {"action": "skipped", "reason": "Only paper mode is enabled"}

    config = _parse_json(run.config_snapshot_json, {})
    symbol = str(config.get("symbol") or "EURUSD").upper()
    rules = config.get("rules") or {}
    lot_size = float(rules.get("lot_size", 0.01))
    stop_pips = float(rules.get("stop_pips", 15))
    rr_target = float(rules.get("rr_target", 2.0))

    ac = db.get(PaperAccount, run.paper_account_id)
    if ac is None:
        run.status = "failed"
        return {"action": "failed", "reason": "Paper account missing"}

    open_count = int(
        db.execute(
            select(sql_func.count())
            .select_from(PaperPosition)
            .where(
                PaperPosition.paper_account_id == ac.id,
                PaperPosition.status == PaperPositionStatus.OPEN,
                PaperPosition.symbol == symbol,
            )
        ).scalar()
        or 0
    )

    summary = _summary(run)
    summary["ticks"] = int(summary.get("ticks", 0)) + 1

    if open_count > 0:
        log_audit_event(
            db,
            user_id=user_id,
            entity_type="strategy_run",
            entity_id=run.id,
            event_type="STRATEGY_TICK_SKIP",
            severity="info",
            message=f"Tick {summary['ticks']}: open {symbol} position exists — no new entry.",
        )
        _save_summary(db, run, summary)
        db.commit()
        return {"action": "skipped", "reason": "Open position on symbol", "tick": summary["ticks"]}

    candles = generate_demo_candles(symbol, bars=30, seed=hash(run.id) % 10_000)
    reference = candles[-1].close
    pip = 0.0001 if reference < 10 else 0.1 if reference > 1000 else 0.01
    stop_loss = round(reference - stop_pips * pip, 5)
    take_profit = round(reference + stop_pips * pip * rr_target, 5)

    summary["orders_submitted"] = int(summary.get("orders_submitted", 0)) + 1
    order, position, err = submit_paper_market_order(
        db,
        user_id=user_id,
        account=ac,
        symbol=symbol,
        side=PaperOrderSide.BUY,
        lot_size=lot_size,
        reference_price=reference,
        stop_loss=stop_loss,
        take_profit=take_profit,
    )

    if err:
        summary["orders_rejected"] = int(summary.get("orders_rejected", 0)) + 1
        log_audit_event(
            db,
            user_id=user_id,
            entity_type="strategy_run",
            entity_id=run.id,
            event_type="STRATEGY_ORDER_REJECTED",
            severity="warning",
            message=f"Order rejected: {err}",
            metadata={"order_id": order.id if order else None},
        )
        _save_summary(db, run, summary)
        db.commit()
        return {
            "action": "rejected",
            "reason": err,
            "tick": summary["ticks"],
            "order_id": order.id if order else None,
        }

    summary["orders_filled"] = int(summary.get("orders_filled", 0)) + 1
    log_audit_event(
        db,
        user_id=user_id,
        entity_type="strategy_run",
        entity_id=run.id,
        event_type="STRATEGY_ORDER_FILLED",
        severity="info",
        message=f"Paper order filled @ {order.filled_avg_price if order else reference}",
        metadata={
            "order_id": order.id if order else None,
            "position_id": position.id if position else None,
        },
    )
    _save_summary(db, run, summary)
    db.commit()
    return {
        "action": "filled",
        "tick": summary["ticks"],
        "order_id": order.id if order else None,
        "position_id": position.id if position else None,
        "reference_price": reference,
    }
