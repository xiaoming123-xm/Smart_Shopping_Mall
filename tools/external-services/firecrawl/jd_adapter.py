from __future__ import annotations

from typing import Any


def parse_jd_products(response: dict[str, Any], category_id: int, keyword: str, limit: int) -> list[dict[str, Any]]:
    raise NotImplementedError("JD adapter is reserved for the second integration phase.")
