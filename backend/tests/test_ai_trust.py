"""AI trust layer tests."""

import pytest

from app.services.ai_trust import enrich_insights

_BANNED_PHRASES = [
    "buy now",
    "sell now",
    "open long",
    "open short",
    "take this trade",
    "trade signal",
    "will go up",
    "will go down",
    "risk more",
    "increase lot size",
    "safe trade",
    "guaranteed profit",
    "can't lose",
    "sure win",
    "double your account",
    "recover losses",
    "martingale",
]


@pytest.mark.parametrize("phrase", _BANNED_PHRASES)
def test_scrubs_banned_phrases(phrase: str):
    raw = [
        {
            "type": "warning",
            "impact": "high",
            "title": f"Advice: {phrase} on EURUSD",
            "description": f"You should {phrase} today.",
            "action": f"Do not ignore — {phrase}.",
        }
    ]
    out = enrich_insights(raw, trade_count=10)
    combined = f"{out[0]['title']} {out[0]['description']} {out[0]['action']}".lower()
    assert phrase not in combined


def test_scrubs_buy_now_language():
    raw = [
        {
            "type": "warning",
            "impact": "high",
            "title": "Buy now on EURUSD",
            "description": "Guaranteed profit if you enter long now.",
            "action": "Sell now before the crash.",
        }
    ]
    out = enrich_insights(raw, trade_count=10)
    assert "buy now" not in out[0]["title"].lower()
    assert "guaranteed profit" not in out[0]["description"].lower()
    assert out[0]["limitations"]
    assert out[0]["data_used"]


def test_adds_metadata_defaults():
    out = enrich_insights(
        [{"type": "pattern", "impact": "low", "title": "T", "description": "D", "action": "A"}],
        trade_count=3,
        date_range="last 30 days",
    )
    assert out[0]["confidence"] == "medium"
    assert "3 trades" in out[0]["data_used"]
    assert "behavioral analysis only" in out[0]["limitations"].lower()
