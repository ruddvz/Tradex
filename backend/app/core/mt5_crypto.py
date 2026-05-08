"""Encrypt/decrypt MT5 password at rest (Fernet key derived from SECRET_KEY)."""

from __future__ import annotations

import base64
import hashlib

from cryptography.fernet import Fernet

from .config import settings


def _fernet() -> Fernet:
    digest = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)


def encrypt_mt5_secret(plain: str) -> str:
    return _fernet().encrypt(plain.encode("utf-8")).decode("ascii")


def decrypt_mt5_secret(token: str) -> str:
    return _fernet().decrypt(token.encode("ascii")).decode("utf-8")
