"""Auth token and cookie tests."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Response
from fastapi.testclient import TestClient
from jose import jwt

from app.core.auth_cookies import (
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    clear_auth_cookies,
    set_auth_cookies,
)
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)


def test_access_and_refresh_token_types():
    uid = "user-abc"
    access = create_access_token(uid)
    refresh = create_refresh_token(uid)
    assert decode_token(access, expected_type="access") == uid
    assert decode_token(refresh, expected_type="refresh") == uid
    assert decode_token(access, expected_type="refresh") is None
    assert decode_token(refresh, expected_type="access") is None


def test_legacy_token_without_type_still_decodes():
    expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    legacy = jwt.encode(
        {"sub": "legacy-user", "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    assert decode_token(legacy) == "legacy-user"
    assert decode_token(legacy, expected_type="access") is None


def test_auth_cookies_set_and_clear():
    app = FastAPI()

    @app.get("/set")
    def set_cookies(response: Response):
        set_auth_cookies(response, access_token="access123", refresh_token="refresh456")
        return {"ok": True}

    @app.post("/clear")
    def clear_cookies(response: Response):
        clear_auth_cookies(response)
        return {"ok": True}

    client = TestClient(app)
    res = client.get("/set")
    assert res.status_code == 200
    assert client.cookies.get(ACCESS_COOKIE) == "access123"
    assert client.cookies.get(REFRESH_COOKIE) == "refresh456"

    res2 = client.post("/clear")
    assert res2.status_code == 200
