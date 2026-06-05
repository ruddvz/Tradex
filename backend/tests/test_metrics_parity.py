"""Metrics parity — backend golden fixtures for Reports analytics."""

from __future__ import annotations

from app.services.analytics import compute_metrics

# Canonical fixture mirrored in frontend demo calculations (sorted by entry_time).
METRICS_FIXTURE_TRADES = [
    {
        "symbol": "EURUSD",
        "status": "WIN",
        "pnl": 120.0,
        "r_multiple": 2.0,
        "entry_time": "2026-01-02T10:00:00",
        "duration": 3600,
    },
    {
        "symbol": "GBPUSD",
        "status": "LOSS",
        "pnl": -60.0,
        "r_multiple": -1.0,
        "entry_time": "2026-01-03T14:00:00",
        "duration": 1800,
    },
    {
        "symbol": "XAUUSD",
        "status": "WIN",
        "pnl": 80.0,
        "r_multiple": 1.5,
        "entry_time": "2026-01-03T16:00:00",
        "duration": 2400,
    },
]

EXPECTED_METRICS = {
    "total_pnl": 140.0,
    "win_rate": 66.7,
    "profit_factor": 3.33,
    "total_trades": 3,
    "win_trades": 2,
    "loss_trades": 1,
    "best_trade": 120.0,
    "worst_trade": -60.0,
    "trading_days": 2,
}


def test_metrics_fixture_golden_values():
    m = compute_metrics(METRICS_FIXTURE_TRADES)
    for key, expected in EXPECTED_METRICS.items():
        assert m[key] == expected, f"{key}: got {m[key]}, expected {expected}"


def test_metrics_empty_trades():
    m = compute_metrics([])
    assert m["total_trades"] == 0
    assert m["total_pnl"] == 0
    assert m["equity_curve"] == []
