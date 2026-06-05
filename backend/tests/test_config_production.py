"""Production config guards."""

import pytest

from app.core.config import Settings


def test_production_rejects_default_secret():
    s = Settings(DEBUG=False, SECRET_KEY="your-secret-key-change-in-production")
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        s.validate_production()


def test_production_accepts_strong_secret():
    s = Settings(DEBUG=False, SECRET_KEY="x" * 40)
    s.validate_production()


def test_debug_skips_secret_check():
    s = Settings(DEBUG=True, SECRET_KEY="changeme")
    s.validate_production()
