from __future__ import annotations

from typing import Any


def parse_taobao_products(response: dict[str, Any], category_id: int, keyword: str, limit: int) -> list[dict[str, Any]]:
    raise NotImplementedError("Taobao adapter is reserved for the second integration phase.")
