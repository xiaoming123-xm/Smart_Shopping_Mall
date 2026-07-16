from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any


class FirecrawlError(RuntimeError):
    pass


@dataclass(frozen=True)
class FirecrawlClient:
    base_url: str = os.getenv("FIRECRAWL_BASE_URL", "http://localhost:3002")
    api_key: str = os.getenv("FIRECRAWL_API_KEY", "")
    timeout: float = float(os.getenv("FIRECRAWL_TIMEOUT", "30"))

    def scrape(self, url: str, formats: list[str] | None = None, only_main_content: bool = True) -> dict[str, Any]:
        payload = {
            "url": url,
            "formats": formats or ["markdown", "html"],
            "onlyMainContent": only_main_content,
        }
        return self._post("/v1/scrape", payload)

    def crawl(self, url: str, limit: int = 5, formats: list[str] | None = None) -> dict[str, Any]:
        payload = {
            "url": url,
            "limit": limit,
            "scrapeOptions": {"formats": formats or ["markdown", "html"]},
        }
        return self._post("/v1/crawl", payload)

    def _post(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        url = self.base_url.rstrip("/") + path
        data = json.dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        request = urllib.request.Request(url, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                body = response.read().decode("utf-8")
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise FirecrawlError(f"Firecrawl HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise FirecrawlError(f"Firecrawl unavailable at {url}: {exc.reason}") from exc
        except json.JSONDecodeError as exc:
            raise FirecrawlError(f"Firecrawl returned invalid JSON: {exc}") from exc
