from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Any


_PRODUCT_LINK_RE = re.compile(r"https?://[^\s)\]\\\"']*(?:yangkeduo|pinduoduo|pdd)[^\s)\]\\\"']*", re.I)
_PRICE_RE = re.compile(r"(?:¥|￥|RMB|CNY)\s*([0-9]+(?:\.[0-9]{1,2})?)", re.I)
_IMAGE_RE = re.compile(r"https?://[^\s)\]\\\"']+\.(?:jpg|jpeg|png|webp)(?:\?[^\s)\]\\\"']*)?", re.I)
_SALES_RE = re.compile(r"([0-9]+(?:\.[0-9]+)?)(万)?\s*(?:人付款|已售|销量|sold)", re.I)


def build_pdd_search_url(keyword: str) -> str:
    from urllib.parse import quote

    return "https://mobile.yangkeduo.com/search_result.html?search_key=" + quote(keyword or "热销商品")


def parse_pdd_products(response: dict[str, Any], category_id: int, keyword: str, limit: int) -> list[dict[str, Any]]:
    text = _extract_text(response)
    links = _unique(_PRODUCT_LINK_RE.findall(text))
    images = _unique(_IMAGE_RE.findall(text))
    prices = [float(x) for x in _PRICE_RE.findall(text)]
    sales = [_parse_sales(match) for match in _SALES_RE.findall(text)]

    rows: list[dict[str, Any]] = []
    candidates = links or [build_pdd_search_url(keyword)]
    for index, source_url in enumerate(candidates[:limit], 1):
        name = _guess_name(text, keyword, index)
        rows.append(
            {
                "category_id": category_id,
                "platform": "PDD",
                "source_product_id": _source_id(source_url),
                "product_name": name,
                "image_url": images[index - 1] if index <= len(images) else "",
                "source_url": source_url,
                "sales_7d": sales[index - 1] if index <= len(sales) else None,
                "avg_price": prices[index - 1] if index <= len(prices) else None,
                "rank_no": index,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "evidence": {
                    "sales": "page_visible" if index <= len(sales) else "missing",
                    "price": "page_visible" if index <= len(prices) else "missing",
                    "name": "heuristic",
                },
            }
        )
    return rows


def _extract_text(response: dict[str, Any]) -> str:
    data = response.get("data", response)
    if isinstance(data, list):
        return "\n".join(_extract_text(item) for item in data if isinstance(item, dict))
    if not isinstance(data, dict):
        return str(data)
    parts: list[str] = []
    for key in ("markdown", "html", "content", "text"):
        value = data.get(key)
        if value:
            parts.append(str(value))
    metadata = data.get("metadata")
    if isinstance(metadata, dict):
        parts.extend(str(v) for v in metadata.values() if v)
    return "\n".join(parts)


def _parse_sales(match: tuple[str, str]) -> int:
    number, unit = match
    value = float(number)
    if unit == "万":
        value *= 10000
    return int(value)


def _guess_name(text: str, keyword: str, index: int) -> str:
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = re.sub(r"\s+", " ", clean).strip()
    if clean:
        window = clean[:80].strip(" -_|,.")
        if window:
            return window[:60]
    return f"{keyword or 'PDD'} selection item {index}"


def _source_id(source_url: str) -> str:
    return hashlib.sha1(source_url.encode("utf-8")).hexdigest()[:16]


def _unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result
