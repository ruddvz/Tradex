"""Simple OHLC backtest runner (MVP — candle-based, not order-book)."""

from __future__ import annotations

import json
import random
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from typing import Any, Optional


@dataclass
class Candle:
    ts: str
    open: float
    high: float
    low: float
    close: float


@dataclass
class BacktestAssumptions:
    spread_pips: float = 1.2
    slippage_pips: float = 0.5
    commission_per_lot: float = 7.0
    lot_size: float = 0.1
    starting_balance: float = 100_000.0


@dataclass
class SimTrade:
    entry_time: str
    exit_time: str
    symbol: str
    direction: str
    entry_price: float
    exit_price: float
    pnl: float
    r_multiple: float


def generate_demo_candles(
    symbol: str = "EURUSD",
    *,
    bars: int = 240,
    seed: int = 42,
) -> list[Candle]:
    """Synthetic OHLC series for MVP backtests (not live market data)."""
    rng = random.Random(seed)
    base = 1.0850 if "EUR" in symbol.upper() else 2650.0 if "XAU" in symbol.upper() else 100.0
    step = 0.0008 if base < 10 else 0.8 if base > 1000 else 0.05
    t0 = datetime(2025, 1, 2, 8, 0, 0)
    price = base
    out: list[Candle] = []
    for i in range(bars):
        drift = rng.uniform(-step, step)
        o = price
        c = max(step, o + drift)
        h = max(o, c) + abs(rng.uniform(0, step * 0.6))
        candle_low = min(o, c) - abs(rng.uniform(0, step * 0.6))
        ts = (t0 + timedelta(hours=i)).isoformat()
        out.append(
            Candle(
                ts=ts,
                open=round(o, 5),
                high=round(h, 5),
                low=round(candle_low, 5),
                close=round(c, 5),
            )
        )
        price = c
    return out


def _pip_size(symbol: str) -> float:
    s = symbol.upper()
    if "JPY" in s:
        return 0.01
    if "XAU" in s or "GOLD" in s:
        return 0.1
    return 0.0001


def _cost_per_side(assumptions: BacktestAssumptions, symbol: str, price: float) -> float:
    pip = _pip_size(symbol)
    spread = assumptions.spread_pips * pip * assumptions.lot_size * 100_000 / max(price, 0.0001)
    slip = assumptions.slippage_pips * pip * assumptions.lot_size * 100_000 / max(price, 0.0001)
    comm = assumptions.commission_per_lot * assumptions.lot_size
    return spread + slip + comm


def run_simple_breakout_backtest(
    candles: list[Candle],
    symbol: str,
    rules: dict[str, Any],
    assumptions: BacktestAssumptions,
) -> tuple[list[SimTrade], list[dict[str, Any]], dict[str, Any]]:
    """
    Long-only breakout: enter when close breaks prior N-bar high; exit at R:R or stop.
    rules: lookback (int), rr_target (float), stop_pips (float)
    """
    lookback = int(rules.get("lookback", 12))
    rr_target = float(rules.get("rr_target", 2.0))
    stop_pips = float(rules.get("stop_pips", 15))
    pip = _pip_size(symbol)
    stop_dist = stop_pips * pip

    trades: list[SimTrade] = []
    equity = assumptions.starting_balance
    curve: list[dict[str, Any]] = [{"date": candles[0].ts[:10], "equity": round(equity, 2)}]

    i = lookback
    while i < len(candles) - 1:
        window = candles[i - lookback : i]
        prior_high = max(c.high for c in window)
        bar = candles[i]
        if bar.close <= prior_high:
            i += 1
            continue

        entry = bar.close + assumptions.slippage_pips * pip
        stop = entry - stop_dist
        target = entry + stop_dist * rr_target
        entry_cost = _cost_per_side(assumptions, symbol, entry)

        j = i + 1
        exit_price = entry
        exit_time = bar.ts
        while j < len(candles):
            c = candles[j]
            if c.low <= stop:
                exit_price = stop - assumptions.slippage_pips * pip
                exit_time = c.ts
                break
            if c.high >= target:
                exit_price = target - assumptions.slippage_pips * pip
                exit_time = c.ts
                break
            j += 1
        else:
            last = candles[-1]
            exit_price = last.close
            exit_time = last.ts

        exit_cost = _cost_per_side(assumptions, symbol, exit_price)
        raw_pnl = (exit_price - entry) * assumptions.lot_size * 100_000
        pnl = raw_pnl - entry_cost - exit_cost
        risk = stop_dist * assumptions.lot_size * 100_000
        r_mult = pnl / risk if risk > 0 else 0.0

        trades.append(
            SimTrade(
                entry_time=bar.ts,
                exit_time=exit_time,
                symbol=symbol,
                direction="LONG",
                entry_price=round(entry, 5),
                exit_price=round(exit_price, 5),
                pnl=round(pnl, 2),
                r_multiple=round(r_mult, 2),
            )
        )
        equity += pnl
        curve.append({"date": exit_time[:10], "equity": round(equity, 2)})
        i = max(j, i + 1) + 1

    metrics = _compute_metrics(trades, equity, assumptions.starting_balance, symbol)
    return trades, curve, metrics


def _compute_metrics(
    trades: list[SimTrade],
    ending_equity: float,
    starting_balance: float,
    symbol: str,
) -> dict[str, Any]:
    if not trades:
        return {
            "net_pnl": 0.0,
            "return_pct": 0.0,
            "max_drawdown_pct": 0.0,
            "profit_factor": 0.0,
            "win_rate": 0.0,
            "avg_win": 0.0,
            "avg_loss": 0.0,
            "expectancy": 0.0,
            "trade_count": 0,
            "longest_losing_streak": 0,
            "best_symbol": symbol,
            "worst_symbol": symbol,
        }

    pnls = [t.pnl for t in trades]
    wins = [p for p in pnls if p > 0]
    losses = [p for p in pnls if p <= 0]
    gross_win = sum(wins)
    gross_loss = abs(sum(losses))
    pf = gross_win / gross_loss if gross_loss > 0.01 else (99.0 if gross_win > 0 else 0.0)

    equity = starting_balance
    peak = equity
    max_dd = 0.0
    for p in pnls:
        equity += p
        peak = max(peak, equity)
        dd = (peak - equity) / peak * 100 if peak > 0 else 0
        max_dd = max(max_dd, dd)

    streak = 0
    max_streak = 0
    for p in pnls:
        if p <= 0:
            streak += 1
            max_streak = max(max_streak, streak)
        else:
            streak = 0

    net = sum(pnls)
    ret_pct = net / starting_balance * 100 if starting_balance else 0
    wr = len(wins) / len(trades) * 100
    avg_w = sum(wins) / len(wins) if wins else 0
    avg_l = sum(losses) / len(losses) if losses else 0
    expectancy = net / len(trades)

    return {
        "net_pnl": round(net, 2),
        "return_pct": round(ret_pct, 2),
        "max_drawdown_pct": round(max_dd, 2),
        "profit_factor": round(min(pf, 99), 2),
        "win_rate": round(wr, 1),
        "avg_win": round(avg_w, 2),
        "avg_loss": round(avg_l, 2),
        "expectancy": round(expectancy, 2),
        "trade_count": len(trades),
        "longest_losing_streak": max_streak,
        "best_symbol": symbol,
        "worst_symbol": symbol,
    }


def run_backtest(
    *,
    symbol: str,
    rules: dict[str, Any],
    assumptions: Optional[BacktestAssumptions] = None,
    candles: Optional[list[Candle]] = None,
) -> dict[str, Any]:
    assumptions = assumptions or BacktestAssumptions()
    candle_list = candles or generate_demo_candles(symbol)
    trades, curve, metrics = run_simple_breakout_backtest(candle_list, symbol, rules, assumptions)
    return {
        "trades": [asdict(t) for t in trades],
        "equity_curve": curve,
        "metrics": metrics,
        "assumptions": asdict(assumptions),
        "candle_count": len(candle_list),
        "data_label": "synthetic_demo",
    }


def dumps_json(obj: Any) -> str:
    return json.dumps(obj, separators=(",", ":"))
