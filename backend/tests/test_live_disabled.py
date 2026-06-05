"""Live broker execution must remain impossible in MVP."""

import pytest

from app.services.broker_base import DisabledLiveBroker, LiveExecutionDisabledError


def test_live_broker_always_disabled_market_order():
    broker = DisabledLiveBroker()
    with pytest.raises(LiveExecutionDisabledError) as exc:
        broker.place_market_order(symbol="EURUSD", side="buy", lot_size=0.01)
    assert "disabled" in str(exc.value).lower()


def test_live_broker_balance_raises():
    broker = DisabledLiveBroker()
    with pytest.raises(LiveExecutionDisabledError):
        broker.get_account_balance()
