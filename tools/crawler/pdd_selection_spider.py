#!/usr/bin/env python3
"""
PDD 选品数据抓取工具入口。

当前脚本默认输出可演示的结构化 JSONL，便于后端任务 API 接入和本地开发。
如后续接入授权 API 或允许访问的公开页面，可在 fetch_items 中替换实现。
"""

from __future__ import annotations

import argparse
import json
import os
import random
import time
from datetime import datetime, timezone
from pathlib import Path


USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Smart Mall PDD selection crawler")
    parser.add_argument("--task-id", required=True)
    parser.add_argument("--category-id", type=int, required=True)
    parser.add_argument("--keyword", required=True)
    parser.add_argument("--limit", type=int, default=200)
    parser.add_argument("--sort", default="sales")
    parser.add_argument("--output", required=True)
    parser.add_argument("--proxy", default=os.getenv("PDD_CRAWLER_PROXY", ""))
    parser.add_argument("--min-delay", type=float, default=0.4)
    parser.add_argument("--max-delay", type=float, default=1.2)
    return parser.parse_args()


def fetch_items(args: argparse.Namespace) -> list[dict]:
    user_agent = random.choice(USER_AGENTS)
    proxy = args.proxy or None
    items: list[dict] = []

    # 这里保留 Playwright/Selenium 接入边界，但默认不绕过登录、验证码或平台风控。
    # 后续若使用授权 API，可把 user_agent/proxy 作为普通网络配置传入。
    for idx in range(1, min(args.limit, 200) + 1):
        time.sleep(random.uniform(args.min_delay, args.max_delay))
        price = round(18 + idx * 0.73 + args.category_id % 9, 2)
        items.append(
            {
                "task_id": args.task_id,
                "category_id": args.category_id,
                "platform": "PDD",
                "source_product_id": f"{args.task_id}-{idx}",
                "product_name": f"{args.keyword} 热销款 {idx}",
                "image_url": f"https://placehold.co/360x360?text={args.keyword}+{idx}",
                "source_url": f"https://mobile.yangkeduo.com/search_result.html?search_key={args.keyword}",
                "sales_7d": max(100, 12000 - idx * 37),
                "avg_price": price,
                "profit_estimate": round(price * random.uniform(0.18, 0.42), 2),
                "trend_tag": random.choice(["销量飙升", "新晋爆款", "高利润", "稳定热销"]),
                "competition_level": random.choice(["低", "中", "高"]),
                "rank_no": idx,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "user_agent": user_agent,
                "proxy_enabled": bool(proxy),
            }
        )
    return items


def main() -> None:
    args = parse_args()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    rows = fetch_items(args)
    with output.open("w", encoding="utf-8") as fp:
        for row in rows:
            fp.write(json.dumps(row, ensure_ascii=False) + "\n")
    print(json.dumps({"task_id": args.task_id, "count": len(rows), "output": str(output)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
