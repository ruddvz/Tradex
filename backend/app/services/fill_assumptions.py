"""Per-account paper fill assumptions."""

from __future__ import annotations

from dataclasses import dataclass

from ..models.paper_account import PaperAccount


@dataclass(frozen=True)
class FillAssumptions:
    spread_multiplier: float = 1.0
    slippage_factor: float = 0.5
    commission_per_lot: float = 3.5


def assumptions_from_account(account: PaperAccount) -> FillAssumptions:
    return FillAssumptions(
        spread_multiplier=float(account.fill_spread_multiplier or 1.0),
        slippage_factor=float(account.fill_slippage_factor or 0.5),
        commission_per_lot=float(account.fill_commission_per_lot or 3.5),
    )
