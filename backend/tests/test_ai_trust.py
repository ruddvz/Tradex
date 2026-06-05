"""AI trust layer tests."""

from app.services.ai_trust import enrich_insights


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
