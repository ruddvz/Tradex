"""Backtesting service unit tests."""

from __future__ import annotations

from app.services.backtesting import BacktestAssumptions, generate_demo_candles, run_backtest


def test_run_backtest_produces_trades_and_metrics():
    candles = generate_demo_candles("EURUSD", bars=120, seed=7)
    result = run_backtest(
        symbol="EURUSD",
        rules={"lookback": 8, "rr_target": 2.0, "stop_pips": 12},
        assumptions=BacktestAssumptions(starting_balance=10_000),
        candles=candles,
        data_label="synthetic_demo",
    )
    assert result["metrics"]["trade_count"] >= 0
    assert len(result["equity_curve"]) >= 1
    assert result["data_label"] == "synthetic_demo"
    assert "spread_pips" in result["assumptions"]


def test_backtest_has_trades_on_breakout_data():
    candles = generate_demo_candles("EURUSD", bars=240, seed=1)
    result = run_backtest(
        symbol="EURUSD",
        rules={"lookback": 10, "rr_target": 1.5, "stop_pips": 10},
        candles=candles,
        data_label="synthetic_demo",
    )
    assert result["metrics"]["trade_count"] > 0
    assert len(result["trades"]) == result["metrics"]["trade_count"]
