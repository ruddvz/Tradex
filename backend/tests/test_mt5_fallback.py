"""MT5 demo fallback must not run in production-like settings."""

import asyncio
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from app.core.config import settings

MT5_PATH = "app.services.mt5_sync.MT5SyncService"


def _run(coro):
    return asyncio.run(coro)


async def _sync_mt5_under_patches(*, debug: bool, allow_fallback: bool):
    from app.api.v1 import sync_api

    with (
        patch.object(settings, "DEBUG", debug),
        patch.object(settings, "ALLOW_DEMO_MT5_FALLBACK", allow_fallback),
    ):
        user = MagicMock()
        user.id = "user-1"
        db = MagicMock()
        db.refresh = MagicMock()
        db.execute.return_value.scalars.return_value.all.return_value = []
        db.commit = MagicMock()
        body = sync_api.Mt5SyncIn(days=30)

        service = MagicMock()
        service.connect.return_value = False
        service.fetch_trades.return_value = []
        service.disconnect = MagicMock()

        demo_patch = patch(
            f"{MT5_PATH}.demo_sample_trades", return_value=[{"mt5_ticket": "demo-001"}]
        )
        with (
            patch(MT5_PATH, return_value=service),
            patch.object(sync_api, "resolve_mt5_credentials", return_value=(12345, "pw", "server")),
            patch.object(sync_api, "resolve_owned_account_id", return_value="acct-1"),
            demo_patch,
        ):
            if debug and allow_fallback:
                with patch.object(sync_api, "trade_from_mt5_dict") as mock_codec:
                    mock_codec.return_value = MagicMock()
                    return await sync_api.sync_mt5(body=body, user=user, db=db)
            with pytest.raises(HTTPException) as exc:
                await sync_api.sync_mt5(body=body, user=user, db=db)
            return exc.value


def test_mt5_unavailable_production_like_returns_503():
    exc = _run(_sync_mt5_under_patches(debug=False, allow_fallback=False))
    assert isinstance(exc, HTTPException)
    assert exc.status_code == 503
    assert "MT5 terminal unavailable" in exc.detail


def test_mt5_debug_without_fallback_returns_503():
    exc = _run(_sync_mt5_under_patches(debug=True, allow_fallback=False))
    assert isinstance(exc, HTTPException)
    assert exc.status_code == 503


def test_mt5_debug_with_fallback_imports_demo_sample():
    result = _run(_sync_mt5_under_patches(debug=True, allow_fallback=True))
    assert result["import_kind"] == "demo_mt5_sample"
    assert result["demo_fallback_used"] is True
