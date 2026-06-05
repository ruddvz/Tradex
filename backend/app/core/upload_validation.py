"""Upload content validation — magic bytes and size."""

from __future__ import annotations

import io

# PNG, JPEG, GIF, WebP magic signatures
_IMAGE_SIGNATURES: list[tuple[bytes, str]] = [
    (b"\x89PNG\r\n\x1a\n", "image/png"),
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"GIF87a", "image/gif"),
    (b"GIF89a", "image/gif"),
    (b"RIFF", "image/webp"),  # RIFF....WEBP checked below
]


def detect_image_content_type(data: bytes) -> str | None:
    """Return MIME type from magic bytes, or None if unrecognized."""
    if len(data) < 12:
        return None
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    for sig, mime in _IMAGE_SIGNATURES:
        if sig == b"RIFF":
            continue
        if data.startswith(sig):
            return mime
    return None


def validate_image_upload(data: bytes, declared_type: str) -> None:
    """Raise ValueError if bytes do not match a supported image type."""
    detected = detect_image_content_type(data)
    if not detected:
        raise ValueError("File content is not a supported image (PNG, JPEG, WebP, GIF)")
    declared = (declared_type or "").split(";")[0].strip().lower()
    if declared and declared != detected:
        raise ValueError(f"Declared type {declared} does not match file content ({detected})")


def strip_image_exif(data: bytes, content_type: str) -> bytes:
    """Re-encode image without EXIF metadata. Falls back to original bytes on failure."""
    try:
        from PIL import Image
    except ImportError:
        return data

    fmt_map = {
        "image/png": "PNG",
        "image/jpeg": "JPEG",
        "image/webp": "WEBP",
        "image/gif": "GIF",
    }
    fmt = fmt_map.get(content_type.split(";")[0].strip().lower())
    if not fmt:
        return data
    try:
        img = Image.open(io.BytesIO(data))
        buf = io.BytesIO()
        save_kwargs = {"format": fmt}
        if fmt == "JPEG":
            save_kwargs["quality"] = 90
        img.save(buf, **save_kwargs)
        return buf.getvalue()
    except Exception:
        return data
