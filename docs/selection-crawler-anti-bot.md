# Selection Crawler Anti-Bot Notes

## What changed

The selection crawler is now designed as a safe collector instead of a blind retry loop.

- Randomized request jitter is applied on every page request.
- Exponential backoff is applied after anomaly signals.
- The crawler stops itself when block-like signals accumulate.
- No login bypass, CAPTCHA bypass, or risk-control circumvention is implemented.
- The backend task status now records anti-crawl evidence for each run.

## Why this is safer

This design reduces the behaviors that usually trigger account or IP risk control:

- No fixed-interval burst traffic.
- No aggressive retry storm after empty pages or transient failures.
- No repeated hammering after CAPTCHA or block-page signals.
- No hidden bypass logic that keeps pushing after the platform says stop.

## What counts as evidence

Each crawler run returns these fields in the task status:

- `antiCrawlStatus`: `HEALTHY`, `THROTTLED`, or `ABORTED_FOR_SAFETY`
- `anomalyCount`: how many suspicious responses were observed
- `blockSignalCount`: how many CAPTCHA or block-like signals were seen
- `backoffCount`: how many cooldowns were applied
- `avgDelayMs` and `maxDelayMs`: proof that pacing happened
- `antiCrawlEvidence`: full JSON summary with guardrail events and verification notes

If `antiCrawlStatus` becomes `ABORTED_FOR_SAFETY`, the crawler intentionally stopped to avoid escalating platform pressure.

## How to verify locally

Run a normal safe simulation:

```powershell
python tools/crawler/pdd_selection_spider.py `
  --task-id demo-safe `
  --category-id 101 `
  --keyword 零食 `
  --output work/demo-safe.jsonl
```

Run a forced block simulation:

```powershell
python tools/crawler/pdd_selection_spider.py `
  --task-id demo-block `
  --category-id 101 `
  --keyword 零食 `
  --simulate-block-on-page 2 `
  --output work/demo-block.jsonl
```

Expected behavior in the forced block run:

- `anomalyCount` increases.
- `backoffCount` increases.
- `guardrail_events` contains `anomaly:*` and `backoff:*`.
- If signals exceed the threshold, `circuit_opened` becomes `true`.
- The task moves to `ABORTED_FOR_SAFETY` instead of continuing to hit the target.

## Important limitation

This proves the guardrails work as designed inside the project. It does not prove immunity against real PDD risk control on the live internet.

To validate against a real production target, only use an authorized API or an explicitly permitted public data source, then observe:

- response distribution over time
- anomaly rate
- stop-rate triggered by the circuit breaker
- whether any account, cookie, or IP receives warnings or restrictions
