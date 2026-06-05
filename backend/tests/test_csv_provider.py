"""CSV candle provider tests."""

from app.services.backtesting import run_backtest
from app.services.market_data.csv_provider import load_candles_from_csv_bytes

CSV_SAMPLE = b"""timestamp,open,high,low,close
2025-01-02 08:00:00,1.0850,1.0860,1.0840,1.0855
2025-01-02 09:00:00,1.0855,1.0870,1.0850,1.0865
2025-01-02 10:00:00,1.0865,1.0880,1.0860,1.0875
2025-01-02 11:00:00,1.0875,1.0890,1.0870,1.0885
2025-01-02 12:00:00,1.0885,1.0900,1.0880,1.0895
2025-01-02 13:00:00,1.0895,1.0910,1.0890,1.0905
2025-01-02 14:00:00,1.0905,1.0920,1.0900,1.0915
2025-01-02 15:00:00,1.0915,1.0930,1.0910,1.0925
2025-01-02 16:00:00,1.0925,1.0940,1.0920,1.0935
2025-01-02 17:00:00,1.0935,1.0950,1.0930,1.0945
"""


def test_load_candles_from_csv():
    candles = load_candles_from_csv_bytes(CSV_SAMPLE, symbol="EURUSD")
    assert len(candles) == 10
    assert candles[0].open == 1.0850


def _large_csv(rows: int = 80) -> bytes:
    from datetime import datetime, timedelta

    lines = ["timestamp,open,high,low,close"]
    price = 1.0850
    t0 = datetime(2025, 1, 2, 8, 0, 0)
    for i in range(rows):
        o = price
        c = price + 0.0001
        ts = (t0 + timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S")
        lines.append(f"{ts},{o},{o+0.001},{o-0.001},{c}")
        price = c
    return "\n".join(lines).encode()


def test_backtest_with_csv_data_label():
    candles = load_candles_from_csv_bytes(_large_csv(80), symbol="EURUSD")
    result = run_backtest(
        symbol="EURUSD",
        rules={"lookback": 4, "rr_target": 2, "stop_pips": 10},
        candles=candles,
        data_label="csv_upload",
    )
    assert result["data_label"] == "csv_upload"
    assert "Synthetic demo candles" not in " ".join(result.get("oos_warnings") or [])


def test_oos_warnings_on_synthetic():
    result = run_backtest(symbol="EURUSD", rules={"lookback": 8, "rr_target": 2, "stop_pips": 12})
    assert any("Synthetic demo" in w for w in result.get("oos_warnings") or [])
