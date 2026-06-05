"""AI coach trust layer — sanitize predictions and attach metadata."""

from __future__ import annotations

import re
from typing import Any, Dict, List

_BANNED_PATTERNS = [
    re.compile(r"\bbuy now\b", re.I),
    re.compile(r"\bsell now\b", re.I),
    re.compile(r"\benter (long|short) now\b", re.I),
    re.compile(r"\bopen long\b", re.I),
    re.compile(r"\bopen short\b", re.I),
    re.compile(r"\btake this trade\b", re.I),
    re.compile(r"\b(trade|entry) signal\b", re.I),
    re.compile(r"\bwill go (up|down)\b", re.I),
    re.compile(r"\brisk more\b", re.I),
    re.compile(r"\bincrease lot size\b", re.I),
    re.compile(r"\bsafe trade\b", re.I),
    re.compile(r"\bguaranteed\b", re.I),
    re.compile(r"\bguaranteed (profit|win|return)\b", re.I),
    re.compile(r"\bcan'?t lose\b", re.I),
    re.compile(r"\bsure win\b", re.I),
    re.compile(r"\b100% win\b", re.I),
    re.compile(r"\bdouble your account\b", re.I),
    re.compile(r"\brecover losses\b", re.I),
    re.compile(r"\bmartingale\b", re.I),
]

_REPLACEMENT = (
    "Review your journal patterns instead of taking new trades based on this summary alone."
)

_DEFAULT_LIMITATIONS = "Behavioral analysis only — not market prediction or financial advice."


def _scrub_text(text: str) -> str:
    out = text
    for pat in _BANNED_PATTERNS:
        out = pat.sub(_REPLACEMENT, out)
    return out


def enrich_insights(
    raw: List[Dict[str, Any]],
    *,
    trade_count: int,
    date_range: str = "all journal trades",
    review_type: str = "behavior_review",
) -> List[Dict[str, Any]]:
    """Add trust metadata and remove buy/sell prediction language."""
    enriched: List[Dict[str, Any]] = []
    for i, item in enumerate(raw):
        title = _scrub_text(str(item.get("title", "")))
        description = _scrub_text(str(item.get("description", "")))
        action = _scrub_text(str(item.get("action", "")))
        enriched.append(
            {
                **item,
                "id": item.get("id") or f"ai-{i}",
                "title": title,
                "description": description,
                "action": action,
                "review_type": item.get("review_type") or review_type,
                "data_used": item.get("data_used") or f"{trade_count} trades · {date_range}",
                "confidence": item.get("confidence") or "medium",
                "limitations": item.get("limitations") or _DEFAULT_LIMITATIONS,
            }
        )
    return enriched
