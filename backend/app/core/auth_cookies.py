"""HttpOnly cookie helpers for JWT auth."""

from __future__ import annotations

from fastapi import Response

from .config import settings

ACCESS_COOKIE = "tradex_access"
REFRESH_COOKIE = "tradex_refresh"


def _cookie_secure() -> bool:
    return not settings.DEBUG


def set_auth_cookies(response: Response, *, access_token: str, refresh_token: str) -> None:
    common = {
        "httponly": True,
        "secure": _cookie_secure(),
        "samesite": "lax",
        "path": "/",
    }
    response.set_cookie(
        ACCESS_COOKIE,
        access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **common,
    )
    response.set_cookie(
        REFRESH_COOKIE,
        refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        **common,
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/")
