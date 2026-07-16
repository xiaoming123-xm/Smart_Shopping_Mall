from __future__ import annotations

from typing import Any


def score_products(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    scored: list[dict[str, Any]] = []
    for row in rows:
        product = dict(row)
        price = product.get("avg_price")
        sales = product.get("sales_7d")
        if product.get("profit_estimate") in (None, ""):
            product["profit_estimate"] = _estimate_profit(price)
        if not product.get("trend_tag"):
            product["trend_tag"] = _trend_tag(sales, product.get("profit_estimate"))
        if not product.get("competition_level"):
            product["competition_level"] = _competition_level(sales, price)
        scored.append(product)
    return scored


def _estimate_profit(price: Any) -> float:
    if price in (None, ""):
        return 0.0
    value = float(price)
    if value <= 20:
        rate = 0.22
    elif value <= 80:
        rate = 0.28
    else:
        rate = 0.18
    return round(value * rate, 2)


def _trend_tag(sales: Any, profit: Any) -> str:
    sales_value = int(sales or 0)
    profit_value = float(profit or 0)
    if sales_value >= 10000:
        return "Hot sale"
    if profit_value >= 20:
        return "High profit"
    if sales_value == 0:
        return "Needs evidence"
    return "Stable"


def _competition_level(sales: Any, price: Any) -> str:
    sales_value = int(sales or 0)
    price_value = float(price or 0)
    if sales_value >= 20000 or price_value <= 10:
        return "High"
    if sales_value >= 5000:
        return "Medium"
    return "Low"
