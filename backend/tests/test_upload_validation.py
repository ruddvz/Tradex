"""Upload validation tests."""

import pytest

from app.core.upload_validation import detect_image_content_type, validate_image_upload

# Minimal valid 1x1 PNG
PNG_1X1 = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
    b"\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
    b"\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01"
    b"\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


def test_detect_png():
    assert detect_image_content_type(PNG_1X1) == "image/png"


def test_reject_non_image():
    assert detect_image_content_type(b"not an image file") is None


def test_validate_mismatch_raises():
    with pytest.raises(ValueError, match="does not match"):
        validate_image_upload(PNG_1X1, "image/jpeg")
