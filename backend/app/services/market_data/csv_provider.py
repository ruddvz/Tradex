"""Parse uploaded CSV files into backtesting Candle objects."""

from __future__ import annotations

import csv
import io
import json
from datetime import datetime
from pathlib import Path
from typing import Any

from ..backtesting import Candle

_REQUIRED = {"timestamp", "open", "high", "low", "close"}
_ALIASES = {
    "timestamp": ("timestamp", "time", "date", "datetime", "ts"),
    "open": ("open", "o"),
    "high": ("high", "h"),
    "low": ("low", "l"),
    "close": ("close", "c"),
}


def _normalize_header(name: str) -> str | None:
    key = name.strip().lower()
    for canonical, variants in _ALIASES.items():
        if key in variants:
            return canonical
    return None


def _parse_ts(raw: str) -> str:
    v = raw.strip().replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(v)
        return dt.isoformat()
    except ValueError:
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y %H:%M:%S"):
            try:
                return datetime.strptime(v, fmt).isoformat()
            except ValueError:
                continue
    raise ValueError(f"Unparseable timestamp: {raw}")


def load_candles_from_csv_bytes(file_bytes: bytes, *, symbol: str) -> list[Candle]:
    """Load OHLC candles from CSV bytes. Raises ValueError on invalid schema."""
    text = file_bytes.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("CSV has no header row")

    col_map: dict[str, str] = {}
    for h in reader.fieldnames:
        canon = _normalize_header(h)
        if canon:
            col_map[canon] = h

    missing = _REQUIRED - set(col_map)
    if missing:
        raise ValueError(f"CSV missing columns: {', '.join(sorted(missing))}")

    candles: list[Candle] = []
    gaps = 0
    prev_ts: str | None = None
    for row in reader:
        try:
            ts = _parse_ts(row[col_map["timestamp"]])
            o = float(row[col_map["open"]])
            h = float(row[col_map["high"]])
            low = float(row[col_map["low"]])
            c = float(row[col_map["close"]])
        except (KeyError, ValueError, TypeError) as exc:
            raise ValueError(f"Invalid CSV row: {exc}") from exc
        if h < max(o, c, low) or low > min(o, c, h):
            raise ValueError(f"Invalid OHLC at {ts}")
        if prev_ts and ts <= prev_ts:
            gaps += 1
        prev_ts = ts
        candles.append(Candle(ts=ts, open=o, high=h, low=low, close=c))

    if len(candles) < 2:
        raise ValueError("CSV must contain at least 2 candles")
    if gaps:
        # Non-fatal — caller may surface as warning
        pass
    return candles


def save_candles_to_path(candles: list[Candle], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = [
        {"ts": c.ts, "open": c.open, "high": c.high, "low": c.low, "close": c.close}
        for c in candles
    ]
    path.write_text(json.dumps(payload), encoding="utf-8")


def load_candles_from_path(path: Path) -> list[Candle]:
    raw: list[dict[str, Any]] = json.loads(path.read_text(encoding="utf-8"))
    return [Candle(**row) for row in raw]
