"""Broker adapter interface — live execution not enabled in Tradex MVP."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Optional


class LiveExecutionDisabledError(RuntimeError):
    """Raised when code paths attempt real-money orders."""


class BrokerAdapter(ABC):
    """Abstract broker; implementations must not bypass risk engine."""

    @abstractmethod
    def place_market_order(
        self,
        *,
        symbol: str,
        side: str,
        lot_size: float,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None,
    ) -> dict[str, Any]:
        """Place a live market order — not available in MVP."""

    @abstractmethod
    def get_account_balance(self) -> float:
        """Return broker account balance."""


class DisabledLiveBroker(BrokerAdapter):
    """Placeholder until live readiness checklist and approvals exist."""

    def place_market_order(self, **kwargs: Any) -> dict[str, Any]:
        raise LiveExecutionDisabledError(
            "Live execution is disabled. Complete the live readiness checklist and obtain manual approval."
        )

    def get_account_balance(self) -> float:
        raise LiveExecutionDisabledError("Live broker connection is not configured.")
