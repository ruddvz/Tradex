"""Simple in-memory rate limiting for auth endpoints."""

from __future__ import annotations

import time
from collections import defaultdict

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

_LIMITED_PATHS = {"/api/v1/auth/login", "/api/v1/auth/register"}
_WINDOW_SEC = 60
_MAX_REQUESTS = 20


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, *, window_sec: int = _WINDOW_SEC, max_requests: int = _MAX_REQUESTS):
        super().__init__(app)
        self.window_sec = window_sec
        self.max_requests = max_requests
        self._hits: dict[str, list[float]] = defaultdict(list)

    def _client_key(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "unknown"

    async def dispatch(self, request: Request, call_next):
        path = request.url.path.rstrip("/") or "/"
        if request.method == "POST" and path in _LIMITED_PATHS:
            key = f"{self._client_key(request)}:{path}"
            now = time.monotonic()
            window_start = now - self.window_sec
            hits = [t for t in self._hits[key] if t >= window_start]
            if len(hits) >= self.max_requests:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests — try again shortly."},
                )
            hits.append(now)
            self._hits[key] = hits
        return await call_next(request)
