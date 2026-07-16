from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Any


REQUIRED_FIELDS = (
    "category_id",
    "platform",
    "source_product_id",
    "product_name",
    "image_url",
    "source_url",
    "sales_7d",
    "avg_price",
    "profit_estimate",
    "trend_tag",
    "competition_level",
    "rank_no",
    "fetched_at",
)


def normalize_products(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in rows:
        source_url = str(row.get("source_url") or "").strip()
        source_product_id = str(row.get("source_product_id") or _hash(source_url or str(row))).strip()
        dedupe_key = f"{row.get('platform', 'PDD')}:{source_product_id}"
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)
        normalized.append(
            {
                "category_id": _as_int(row.get("category_id"), 101),
                "platform": str(row.get("platform") or "PDD").upper(),
                "source_product_id": source_product_id,
                "product_name": str(row.get("product_name") or "Unnamed product").strip(),
                "image_url": str(row.get("image_url") or "").strip(),
                "source_url": source_url,
                "sales_7d": _as_optional_int(row.get("sales_7d")),
                "avg_price": _as_optional_float(row.get("avg_price")),
                "profit_estimate": _as_optional_float(row.get("profit_estimate")),
                "trend_tag": str(row.get("trend_tag") or "").strip(),
                "competition_level": str(row.get("competition_level") or "").strip(),
                "rank_no": _as_int(row.get("rank_no"), len(normalized) + 1),
                "fetched_at": str(row.get("fetched_at") or datetime.now(timezone.utc).isoformat()),
                "data_quality": row.get("data_quality") or row.get("evidence") or {},
            }
        )
    return normalized


def strip_to_backend_contract(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [{field: row.get(field) for field in REQUIRED_FIELDS} for row in rows]


def _hash(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()[:16]


def _as_optional_int(value: Any) -> int | None:
    if value in (None, ""):
        return None
    return int(float(str(value)))


def _as_optional_float(value: Any) -> float | None:
    if value in (None, ""):
        return None
    return round(float(str(value)), 2)


def _as_int(value: Any, default: int) -> int:
    if value in (None, ""):
        return default
    return int(float(str(value)))
