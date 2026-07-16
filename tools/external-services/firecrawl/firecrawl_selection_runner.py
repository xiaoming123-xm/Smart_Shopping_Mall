#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parent))

from export_writer import write_csv, write_json, write_jsonl
from firecrawl_client import FirecrawlClient, FirecrawlError
from pdd_adapter import build_pdd_search_url, parse_pdd_products
from product_normalizer import normalize_products, strip_to_backend_contract
from selection_score import score_products


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Smart Mall Firecrawl selection runner")
    parser.add_argument("--task-id", required=True)
    parser.add_argument("--category-id", type=int, required=True)
    parser.add_argument("--keyword", required=True)
    parser.add_argument("--limit", type=int, default=24)
    parser.add_argument("--sort", default="sales")
    parser.add_argument("--output", required=True)
    parser.add_argument("--source-url", default="")
    parser.add_argument("--base-url", default=os.getenv("FIRECRAWL_BASE_URL", "http://localhost:3002"))
    parser.add_argument("--enabled", action="store_true", default=os.getenv("FIRECRAWL_ENABLED", "").lower() == "true")
    parser.add_argument("--session-dir", default=os.getenv("PDD_CRAWLER_SESSION_DIR", "work/crawler/pdd-browser-profile"))
    parser.add_argument("--require-login", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    started_at = datetime.now(timezone.utc)
    task_id = args.task_id
    source_url = args.source_url or build_pdd_search_url(args.keyword)
    summary = {
        "task_id": task_id,
        "output": args.output,
        "firecrawl_base_url": args.base_url,
        "source_url": source_url,
        "session_dir": str(Path(args.session_dir).resolve()),
        "login_session_ready": login_session_ready(args.session_dir),
        "anti_crawl_status": "PENDING",
        "request_count": 0,
        "anomaly_count": 0,
        "block_signal_count": 0,
        "backoff_count": 0,
        "proxy_enabled": False,
        "user_agent": "firecrawl-service",
        "avg_delay_ms": 0,
        "max_delay_ms": 0,
        "guardrail_events": [],
        "verification_notes": [],
        "compliance_notes": [
            "Firecrawl is used as an external HTTP service only.",
            "This runner does not bypass login, CAPTCHA, or platform risk-control flows.",
        ],
    }

    try:
        if args.require_login and not login_session_ready(args.session_dir):
            raise FirecrawlError("PDD login session is not confirmed. Open PDD login in Selection Center and click confirmation after login.")

        if not args.enabled:
            raise FirecrawlError("Firecrawl runner is disabled. Set FIRECRAWL_ENABLED=true after the service is running.")

        client = FirecrawlClient(base_url=args.base_url)
        response = client.scrape(source_url)
        summary["request_count"] = 1
        write_json(DATA_DIR / "raw" / f"{task_id}.json", response)

        raw_rows = parse_pdd_products(response, args.category_id, args.keyword, args.limit)
        normalized = normalize_products(raw_rows)
        scored = score_products(normalized)
        backend_rows = strip_to_backend_contract(scored)

        write_json(DATA_DIR / "normalized" / f"{task_id}.json", scored)
        write_jsonl(DATA_DIR / "exports" / f"{task_id}.jsonl", backend_rows)
        write_csv(DATA_DIR / "exports" / f"{task_id}.csv", backend_rows)
        write_jsonl(Path(args.output), backend_rows)

        summary.update(
            {
                "count": len(backend_rows),
                "anti_crawl_status": "HEALTHY" if backend_rows else "NO_VISIBLE_PRODUCTS",
                "verification_notes": [
                    f"Raw Firecrawl response saved to {DATA_DIR / 'raw' / (task_id + '.json')}",
                    f"Normalized rows saved to {DATA_DIR / 'normalized' / (task_id + '.json')}",
                    f"Backend export saved to {DATA_DIR / 'exports' / (task_id + '.jsonl')}",
                ],
            }
        )
        if not backend_rows:
            summary["anomaly_count"] = 1
        write_json(DATA_DIR / "logs" / f"{task_id}.summary.json", summary)
        print(json.dumps(summary, ensure_ascii=False))
    except Exception as exc:
        summary.update(
            {
                "count": 0,
                "anti_crawl_status": "FAILED",
                "anomaly_count": 1,
                "finished_at": datetime.now(timezone.utc).isoformat(),
                "fail_reason": str(exc),
                "elapsed_ms": int((datetime.now(timezone.utc) - started_at).total_seconds() * 1000),
            }
        )
        write_json(DATA_DIR / "logs" / f"{task_id}.summary.json", summary)
        print(json.dumps(summary, ensure_ascii=False))
        raise SystemExit(1)


def login_session_ready(session_dir: str) -> bool:
    return (Path(session_dir).resolve() / ".smartmall-pdd-login-confirmed").exists()


if __name__ == "__main__":
    main()
