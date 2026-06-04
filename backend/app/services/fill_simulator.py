"""Configurable spread, slippage, and commission for paper fills."""

from __future__ import annotations

from dataclasses import dataclass

# MVP: fixed assumptions per symbol family (points / $ scale)
_SYMBOL_SPREAD: dict[str, float] = {
    "XAUUSD": 0.35,
    "EURUSD": 0.00012,
    "GBPUSD": 0.00015,
    "USDJPY": 0.012,
    "NAS100": 1.2,
    "US30": 2.0,
}
_DEFAULT_SPREAD = 0.0002
_SLIPPAGE_FACTOR = 0.5  # fraction of spread added as slippage
_COMMISSION_PER_LOT = 3.5


@dataclass
class FillQuote:
    fill_price: float
    spread: float
    slippage: float
    commission: float


def spread_for_symbol(symbol: str) -> float:
    key = (symbol or "").upper()
    return _SYMBOL_SPREAD.get(key, _DEFAULT_SPREAD)


def simulate_market_fill(
    *,
    symbol: str,
    side: str,
    reference_price: float,
    lot_size: float,
) -> FillQuote:
    """Return fill price and cost components for a market order."""
    spread = spread_for_symbol(symbol)
    slippage = spread * _SLIPPAGE_FACTOR
    half = spread / 2.0
    side_l = side.lower()
    if side_l == "buy":
        fill_price = reference_price + half + slippage
    else:
        fill_price = reference_price - half - slippage
    commission = round(_COMMISSION_PER_LOT * max(lot_size, 0.01), 2)
    return FillQuote(
        fill_price=round(fill_price, 5),
        spread=round(spread, 6),
        slippage=round(slippage, 6),
        commission=commission,
    )
