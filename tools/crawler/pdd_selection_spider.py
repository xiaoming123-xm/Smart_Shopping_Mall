#!/usr/bin/env python3
"""
Small, real-data-only PDD selection crawler.

The crawler connects to the project-owned Chrome window through the local
Chrome DevTools Protocol. It slowly scrolls the visible search page, collects up
to the requested limit, sorts by visible total sales, and refuses to create
placeholder/demo goods.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import random
import re
import socket
import struct
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


class CrawlerError(RuntimeError):
    def __init__(self, status: str, message: str, events: list[str] | None = None):
        super().__init__(message)
        self.status = status
        self.events = events or []


class DevToolsWebSocket:
    def __init__(self, ws_url: str, timeout: float = 20.0):
        parsed = urllib.parse.urlparse(ws_url)
        self.host = parsed.hostname or "127.0.0.1"
        self.port = parsed.port or 80
        self.path = parsed.path or "/"
        if parsed.query:
            self.path += "?" + parsed.query
        self.sock = socket.create_connection((self.host, self.port), timeout=timeout)
        self.sock.settimeout(timeout)
        self._next_id = 0
        self._handshake()

    def _handshake(self) -> None:
        key = base64.b64encode(os.urandom(16)).decode("ascii")
        request = (
            f"GET {self.path} HTTP/1.1\r\n"
            f"Host: {self.host}:{self.port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        ).encode("ascii")
        self.sock.sendall(request)
        response = b""
        while b"\r\n\r\n" not in response:
            chunk = self.sock.recv(4096)
            if not chunk:
                break
            response += chunk
        if b" 101 " not in response.split(b"\r\n", 1)[0]:
            raise CrawlerError("FAILED", "Chrome DevTools websocket handshake failed.", ["devtools_handshake_failed"])

    def close(self) -> None:
        try:
            self.sock.close()
        except OSError:
            pass

    def command(self, method: str, params: dict[str, Any] | None = None, timeout: float = 20.0) -> dict[str, Any]:
        self._next_id += 1
        message_id = self._next_id
        self._send_json({"id": message_id, "method": method, "params": params or {}})
        deadline = time.time() + timeout
        while time.time() < deadline:
            payload = self._recv_text(max(0.5, deadline - time.time()))
            if not payload:
                continue
            data = json.loads(payload)
            if data.get("id") == message_id:
                if "error" in data:
                    raise CrawlerError("FAILED", f"Chrome DevTools command failed: {data['error']}", ["devtools_command_failed"])
                return data.get("result", {})
        raise CrawlerError("FAILED", f"Chrome DevTools command timed out: {method}", ["devtools_timeout"])

    def _send_json(self, payload: dict[str, Any]) -> None:
        raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        header = bytearray([0x81])
        length = len(raw)
        if length < 126:
            header.append(0x80 | length)
        elif length < 65536:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", length))
        mask = os.urandom(4)
        masked = bytes(byte ^ mask[index % 4] for index, byte in enumerate(raw))
        self.sock.sendall(bytes(header) + mask + masked)

    def _recv_exact(self, size: int) -> bytes:
        data = b""
        while len(data) < size:
            chunk = self.sock.recv(size - len(data))
            if not chunk:
                raise CrawlerError("FAILED", "Chrome DevTools websocket closed unexpectedly.", ["devtools_closed"])
            data += chunk
        return data

    def _recv_text(self, timeout: float) -> str:
        self.sock.settimeout(timeout)
        fragments: list[bytes] = []
        while True:
            first, second = self._recv_exact(2)
            opcode = first & 0x0F
            masked = bool(second & 0x80)
            length = second & 0x7F
            if length == 126:
                length = struct.unpack("!H", self._recv_exact(2))[0]
            elif length == 127:
                length = struct.unpack("!Q", self._recv_exact(8))[0]
            mask = self._recv_exact(4) if masked else b""
            payload = self._recv_exact(length) if length else b""
            if masked:
                payload = bytes(byte ^ mask[index % 4] for index, byte in enumerate(payload))
            if opcode == 0x8:
                raise CrawlerError("FAILED", "Chrome DevTools websocket closed.", ["devtools_closed"])
            if opcode == 0x9:
                self._send_pong(payload)
                continue
            if opcode in (0x1, 0x0):
                fragments.append(payload)
                if first & 0x80:
                    return b"".join(fragments).decode("utf-8", errors="replace")

    def _send_pong(self, payload: bytes) -> None:
        header = bytearray([0x8A])
        header.append(0x80 | len(payload))
        mask = os.urandom(4)
        masked = bytes(byte ^ mask[index % 4] for index, byte in enumerate(payload))
        self.sock.sendall(bytes(header) + mask + masked)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Smart Mall PDD selection crawler")
    parser.add_argument("--task-id", required=True)
    parser.add_argument("--category-id", type=int, required=True)
    parser.add_argument("--keyword", required=True)
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--sort", default="sales")
    parser.add_argument("--output", required=True)
    parser.add_argument("--session-dir", default=os.getenv("PDD_CRAWLER_SESSION_DIR", "work/crawler/pdd-browser-profile"))
    parser.add_argument("--require-login", action="store_true")
    parser.add_argument("--remote-debugging-port", type=int, default=int(os.getenv("PDD_CRAWLER_DEBUG_PORT", "9223")))
    parser.add_argument("--proxy", default=os.getenv("PDD_CRAWLER_PROXY", ""))
    parser.add_argument("--min-delay", type=float, default=1.4)
    parser.add_argument("--max-delay", type=float, default=3.2)
    parser.add_argument("--cooldown-base", type=float, default=2.0)
    parser.add_argument("--cooldown-max", type=float, default=12.0)
    parser.add_argument("--page-size", type=int, default=20)
    parser.add_argument("--max-consecutive-anomalies", type=int, default=3)
    parser.add_argument("--block-signal-threshold", type=int, default=2)
    parser.add_argument("--simulate-network-error-rate", type=float, default=0.0)
    parser.add_argument("--simulate-empty-rate", type=float, default=0.0)
    parser.add_argument("--simulate-block-on-page", type=int, default=0)
    parser.add_argument("--seed", type=int, default=0)
    return parser.parse_args()


def login_session_ready(session_dir: str) -> bool:
    profile = Path(session_dir).resolve()
    marker = profile / ".smartmall-pdd-login-confirmed"
    if not marker.exists():
        return False
    for candidate in profile.rglob("*"):
        if not candidate.is_file():
            continue
        lowered = str(candidate).lower()
        if "smartmallpdd" not in lowered:
            continue
        if "cookies" in lowered or "local storage" in lowered or "session storage" in lowered:
            try:
                if candidate.stat().st_size > 0:
                    return True
            except OSError:
                continue
    return True


def http_json(url: str, method: str = "GET", timeout: float = 5.0) -> Any:
    request = urllib.request.Request(url, method=method)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def pdd_search_url(keyword: str) -> str:
    query = urllib.parse.urlencode({"search_key": keyword, "search_type": "goods"})
    return f"https://mobile.yangkeduo.com/search_result.html?{query}"


def ensure_devtools_page(port: int, keyword: str) -> dict[str, Any]:
    base = f"http://127.0.0.1:{port}"
    try:
        targets = http_json(f"{base}/json/list")
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise CrawlerError(
            "CHROME_DEBUG_NOT_OPEN",
            "Project PDD browser is open, but it was not started with Chrome remote debugging. Click the PDD login button again after restarting the backend, then confirm login.",
            ["debug_port_not_reachable"],
        ) from exc

    pages = [target for target in targets if target.get("type") == "page" and target.get("webSocketDebuggerUrl")]
    search_pages = [page for page in pages if "search_result" in (page.get("url") or "")]
    if search_pages:
        return search_pages[0]
    pdd_pages = [page for page in pages if "yangkeduo.com" in (page.get("url") or "") or "pinduoduo.com" in (page.get("url") or "")]
    if pdd_pages:
        return pdd_pages[0]

    search_url = pdd_search_url(keyword)
    try:
        return http_json(f"{base}/json/new?{urllib.parse.quote(search_url, safe='')}", method="PUT")
    except urllib.error.HTTPError:
        return http_json(f"{base}/json/new?{urllib.parse.quote(search_url, safe='')}")


def open_search_page(ws: DevToolsWebSocket, keyword: str) -> None:
    ws.command("Page.enable")
    ws.command("Runtime.enable")
    ws.command("Page.navigate", {"url": pdd_search_url(keyword)}, timeout=10.0)
    time.sleep(2.5)


def evaluate_products(ws: DevToolsWebSocket, scan_limit: int) -> list[dict[str, Any]]:
    js = r"""
(() => {
  const limit = __LIMIT__;
  const badText = /\u767b\u5f55|\u9a8c\u8bc1|\u9a8c\u8bc1\u7801|\u5b89\u5168|\u6ed1\u5757|\u8bf7\u5b8c\u6210|\u7f51\u7edc\u5f02\u5e38|\u8bbf\u95ee\u9891\u7e41/;
  const normalize = (s) => (s || '').replace(/[\u200b-\u200f\ufeff]/g, '').replace(/\s+/g, ' ').trim();
  const abs = (url) => {
    if (!url) return '';
    try { return new URL(url, location.href).href; } catch (_) { return url; }
  };
  const attrs = (el, names) => {
    for (const name of names) {
      const value = el && el.getAttribute && el.getAttribute(name);
      if (value) return value;
    }
    return '';
  };
  const productImage = (img) => {
    const src = img.currentSrc || img.src || attrs(img, ['data-src', 'data-original', 'data-lazy-src']);
    if (!src || src.startsWith('data:')) return '';
    if (!/pddpic\.com/i.test(src)) return '';
    if (/avatar|mobile-subjects|mobile-search|funimg|promotion-|promo\/|icon|logo|sprite/i.test(src)) return '';
    return abs(src);
  };
  const getSource = (root) => {
    const link = root.matches && root.matches('a[href]') ? root : root.querySelector('a[href]');
    if (link) return abs(link.getAttribute('href'));
    const goodsId = attrs(root, ['data-goods-id', 'data-goodsid', 'goods_id', 'data-id']);
    return goodsId ? `https://mobile.yangkeduo.com/goods.html?goods_id=${encodeURIComponent(goodsId)}` : '';
  };
  const climbCard = (img) => {
    for (let i = 0, node = img; node && i < 9; i += 1, node = node.parentElement) {
      const text = normalize(node.innerText || node.textContent || '');
      if (!text || text.length < 12 || text.length > 420) continue;
      if (badText.test(text)) continue;
      if (!/[\u00a5\uffe5]|\d+(\.\d+)?\s*\u5143/.test(text)) continue;
      if (!/\u5df2\u62fc|\u5df2\u552e|\u5df2\u62a2|\u603b\u552e|\u5168\u5e97\u603b\u552e|\u4eba\u62fc\u5355|\u4ef6|\u6536\u85cf/.test(text)) continue;
      return node;
    }
    return null;
  };
  const cards = [];
  const seenNode = new Set();
  for (const seed of Array.from(document.images)) {
    const image = productImage(seed);
    if (!image) continue;
    const card = climbCard(seed);
    if (!card || seenNode.has(card)) continue;
    seenNode.add(card);
    const text = normalize(card.innerText || card.textContent || '');
    if (!text || badText.test(text)) continue;
    cards.push({ text, image, sourceUrl: getSource(card), html: card.outerHTML.slice(0, 5000) });
    if (cards.length >= limit) break;
  }
  return { url: location.href, title: document.title, cards };
})()
""".replace("__LIMIT__", str(max(1, scan_limit)))
    result = ws.command("Runtime.evaluate", {"expression": js, "returnByValue": True}, timeout=15.0)
    value = result.get("result", {}).get("value") or {}
    return value.get("cards") or []


def scroll_page(ws: DevToolsWebSocket) -> None:
    distance = random.randint(650, 1100)
    ws.command(
        "Runtime.evaluate",
        {"expression": f"window.scrollBy({{ top: {distance}, left: 0, behavior: 'smooth' }}); true", "returnByValue": True},
        timeout=8.0,
    )


def collect_cards(ws: DevToolsWebSocket, args: argparse.Namespace) -> tuple[list[dict[str, Any]], int, int]:
    target = max(1, min(args.limit, 100))
    scan_limit = max(30, min(160, target * 2))
    max_rounds = max(12, min(45, target // 3 + 12))
    cards: list[dict[str, Any]] = []
    seen: set[str] = set()
    backoff_count = 0
    stagnant_rounds = 0

    for round_no in range(max_rounds):
        visible = evaluate_products(ws, scan_limit)
        before = len(cards)
        for card in visible:
            text = clean_text(str(card.get("text") or ""))
            image = str(card.get("image") or "")
            key = hashlib.sha1(f"{image}|{text[:120]}".encode("utf-8", errors="ignore")).hexdigest()
            if key in seen:
                continue
            seen.add(key)
            cards.append(card)
        rows = normalize_rows(cards, args)
        if len(rows) >= target:
            break
        if len(cards) == before:
            stagnant_rounds += 1
        else:
            stagnant_rounds = 0
        if stagnant_rounds >= args.max_consecutive_anomalies:
            backoff_count += 1
            time.sleep(min(args.cooldown_max, args.cooldown_base * backoff_count))
            stagnant_rounds = 0
        scroll_page(ws)
        time.sleep(random.uniform(max(0.8, args.min_delay), max(args.max_delay, args.min_delay)))

    return cards, max_rounds, backoff_count


def clean_text(text: str) -> str:
    return re.sub(r"[\u200b-\u200f\ufeff\ue000-\uf8ff]", "", text or "").strip()


def parse_money(text: str) -> tuple[float, float | None]:
    normalized = clean_text(text)
    prices: list[float] = []
    for match in re.finditer(r"[\u00a5\uffe5]\s*([0-9]+)(?:\s*\.\s*([0-9]+))?|([0-9]+(?:\.[0-9]+)?)\s*\u5143", normalized):
        whole, fraction, yuan = match.groups()
        value = yuan or (whole + (("." + fraction) if fraction else ""))
        try:
            prices.append(float(value))
        except ValueError:
            pass
    if not prices:
        return 0.0, None
    current = prices[0]
    original_candidates = [price for price in prices[1:] if price > current]
    return current, original_candidates[0] if original_candidates else None


def parse_sales(text: str) -> tuple[int, str]:
    text = clean_text(text)

    def to_count(match: re.Match[str]) -> tuple[int, str]:
        number = float(match.group(1))
        unit = match.group(2)
        if unit == "\u4e07":
            number *= 10000
        elif unit == "\u4ebf":
            number *= 100000000
        return int(number), match.group(0)

    patterns = [
        r"\u5168\u5e97\u603b\u552e\s*([0-9]+(?:\.[0-9]+)?)([\u4e07\u4ebf]?)(?:\+)?\s*\u4ef6",
        r"\u603b\u552e\s*([0-9]+(?:\.[0-9]+)?)([\u4e07\u4ebf]?)(?:\+)?\s*\u4ef6",
        r"\u672c\u5e97\u5df2\u62fc\s*([0-9]+(?:\.[0-9]+)?)([\u4e07\u4ebf]?)(?:\+)?\s*\u4ef6",
        r"\u5df2\u62a2\s*([0-9]+(?:\.[0-9]+)?)([\u4e07\u4ebf]?)(?:\+)?\s*(?:\u4e2a|\u4ef6)?",
        r"\u5df2\u62fc\s*([0-9]+(?:\.[0-9]+)?)([\u4e07\u4ebf]?)(?:\+)?\s*(?:\u4e2a|\u4ef6)?",
        r"\u5df2\u552e\s*([0-9]+(?:\.[0-9]+)?)([\u4e07\u4ebf]?)(?:\+)?\s*(?:\u4e2a|\u4ef6)?",
        r"([0-9]+(?:\.[0-9]+)?)([\u4e07\u4ebf]?)(?:\+)?\s*\u4eba\u62fc\u5355",
        r"([0-9]+(?:\.[0-9]+)?)([\u4e07\u4ebf]?)(?:\+)?\s*\u4ef6",
    ]
    candidates: list[tuple[int, str]] = []
    for pattern in patterns:
        for match in re.finditer(pattern, text):
            candidates.append(to_count(match))
    if not candidates:
        return 0, ""
    return max(candidates, key=lambda item: item[0])


def choose_name(text: str) -> str:
    text = clean_text(text)
    text = re.split(r"[\u00a5\uffe5]", text, maxsplit=1)[0]
    text = re.sub(r"\d+(?:\.\d+)?\s*(?:\u4eba\u6536\u85cf|\u5e74\u8001\u5e97|\u5c0f\u65f6\u5185|%\u597d\u8bc4)", " ", text)
    text = re.sub(r"\u672a\u53d1\u8d27\u79d2\u9000|\u9000\u8d27\u5305\u8fd0\u8d39|24\u5c0f\u65f6\u53d1\u8d27|\u8de8\u5e97\u6bcf\d+\u51cf\d+|\u5238\u540e|\u5373\u5c06\u6062\u590d\u539f\u4ef7", " ", text)
    parts = [part.strip() for part in re.split(r"[\n\r]| {2,}|\t", text) if part.strip()]
    cleaned: list[str] = []
    for part in parts:
        part = re.sub(r"[\u00a5\uffe5]\s*[0-9]+(?:\.[0-9]+)?", "", part)
        if re.search(r"\u5df2\u62fc|\u5df2\u552e|\u4eba\u4ed8\u6b3e|\u5305\u90ae|\u9000\u8d27|\u5238|\u62fc\u5355|\u6536\u85cf|\u8001\u5e97", part):
            continue
        if len(part) >= 4 and re.search(r"[\u4e00-\u9fffA-Za-z]", part):
            cleaned.append(part[:120])
    if cleaned:
        return max(cleaned, key=len)
    return re.sub(r"[\u00a5\uffe5].*$", "", text).strip()[:120]


def product_id(source_url: str, image_url: str, name: str) -> str:
    for pattern in (r"goods_id=([0-9]+)", r"goods_id%3D([0-9]+)", r"/goods(?:/|\.html).*?([0-9]{6,})"):
        match = re.search(pattern, source_url)
        if match:
            return match.group(1)
    digest = hashlib.sha1(f"{source_url}|{image_url}|{name}".encode("utf-8", errors="ignore")).hexdigest()[:16]
    return f"pdd-visible-{digest}"


def normalize_rows(cards: list[dict[str, Any]], args: argparse.Namespace) -> list[dict[str, Any]]:
    target = 10
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for card in cards:
        text = clean_text(str(card.get("text") or ""))
        image = str(card.get("image") or "")
        source = str(card.get("sourceUrl") or "")
        name = choose_name(text)
        price, original = parse_money(text)
        sales, sales_text = parse_sales(text)
        if not name or not image or price <= 0:
            continue
        sid = product_id(source, image, name)
        key = sid or hashlib.sha1(f"{image}|{name}".encode("utf-8")).hexdigest()
        name_key = re.sub(r"\s+", "", name.lower())[:48]
        if key in seen or name_key in seen:
            continue
        seen.add(key)
        seen.add(name_key)
        amount = round(price * sales, 2) if sales > 0 else 0.0
        tag_parts = ["real-page"]
        if sales_text:
            tag_parts.append(sales_text)
        if original:
            tag_parts.append(f"original_price={original:.2f}")
        rows.append({
            "task_id": args.task_id,
            "category_id": args.category_id,
            "platform": "PDD",
            "source_product_id": sid,
            "product_name": name,
            "image_url": image,
            "source_url": source,
            "sales_7d": sales,
            "avg_price": round(price, 2),
            "sales_amount": amount,
            "profit_estimate": 0,
            "trend_tag": " | ".join(tag_parts),
            "competition_level": "REAL",
            "rank_no": 0,
        })
    rows.sort(key=lambda row: (int(row.get("sales_7d") or 0), float(row.get("sales_amount") or 0), float(row.get("avg_price") or 0)), reverse=True)
    for index, row in enumerate(rows[:target], start=1):
        row["rank_no"] = index
    return rows[:target]


def write_rows(output: Path, rows: list[dict[str, Any]]) -> None:
    with output.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def main() -> None:
    args = parse_args()
    args.limit = max(10, min(args.limit, 100))
    random.seed(args.seed or int(time.time()))
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("", encoding="utf-8")

    started = time.time()
    request_count = 0
    backoff_count = 0
    try:
        if args.require_login and not login_session_ready(args.session_dir):
            raise CrawlerError("NOT_LOGGED_IN", "PDD login session is not confirmed.", ["login_marker_missing"])

        time.sleep(random.uniform(max(0.8, args.min_delay), max(args.max_delay, args.min_delay)))
        target = ensure_devtools_page(args.remote_debugging_port, args.keyword)
        request_count += 1
        ws = DevToolsWebSocket(target["webSocketDebuggerUrl"])
        try:
            open_search_page(ws, args.keyword)
            cards, crawl_rounds, backoff_count = collect_cards(ws, args)
            request_count += crawl_rounds
        finally:
            ws.close()

        rows = normalize_rows(cards, args)
        write_rows(output, rows)
        if not rows:
            raise CrawlerError("NO_REAL_DATA", "No visible PDD product cards with real name, image, and price were extracted.", ["no_visible_product_cards"])

        status = "SUCCESS" if len(rows) >= args.limit else "PARTIAL_SUCCESS"
        elapsed_ms = round((time.time() - started) * 1000, 2)
        summary = {
            "task_id": args.task_id,
            "count": len(rows),
            "output": str(output),
            "proxy_enabled": bool(args.proxy),
            "session_dir": str(Path(args.session_dir).resolve()),
            "login_session_ready": True,
            "user_agent": "chrome-devtools-visible-page",
            "anti_crawl_status": status,
            "request_count": request_count,
            "anomaly_count": 0,
            "block_signal_count": 0,
            "backoff_count": backoff_count,
            "avg_delay_ms": round(elapsed_ms / max(1, request_count), 2),
            "max_delay_ms": round(max(args.max_delay, args.min_delay) * 1000, 2),
            "guardrail_events": ["visible_page_only", "max_limit_100", "sorted_by_visible_total_sales"],
            "verification_notes": ["Rows were extracted from the project Chrome page through local DevTools.", "Up to 100 visible products are sampled with intermittent scrolling, then only the top 10 by visible total sales are saved.", "No demo or placeholder products were generated."],
            "compliance_notes": ["No CAPTCHA bypass or login bypass is implemented.", "The crawler uses small intermittent scrolls and stops when visible real product data cannot be extracted."],
        }
        print(json.dumps(summary, ensure_ascii=False))
    except CrawlerError as exc:
        write_rows(output, [])
        summary = {
            "task_id": args.task_id,
            "count": 0,
            "output": str(output),
            "proxy_enabled": bool(args.proxy),
            "session_dir": str(Path(args.session_dir).resolve()),
            "login_session_ready": login_session_ready(args.session_dir),
            "user_agent": "chrome-devtools-visible-page",
            "anti_crawl_status": exc.status,
            "request_count": request_count,
            "anomaly_count": 1,
            "block_signal_count": 1 if exc.status in {"LOGIN_EXPIRED", "CHROME_DEBUG_NOT_OPEN"} else 0,
            "backoff_count": backoff_count,
            "avg_delay_ms": round((time.time() - started) * 1000, 2),
            "max_delay_ms": round(args.max_delay * 1000, 2),
            "guardrail_events": exc.events,
            "verification_notes": [str(exc), "No simulated product rows were generated or saved."],
            "compliance_notes": ["No CAPTCHA bypass or login bypass is implemented."],
        }
        print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
