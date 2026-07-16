# Firecrawl integration plugin

This directory is the Smart Shopping Mall side of the Firecrawl integration. It is not the Firecrawl service source code.

## Boundary

- Firecrawl service root: `D:\python_project\firecrawl`
- Smart Shopping Mall plugin root: `tools/external-services/firecrawl`
- Default service URL: `http://localhost:3002`
- Admin page and backend APIs stay unchanged: `/api/crawler/start-selection`, `/api/selection/categories`, `/api/selection/products`

The backend still defaults to `tools/crawler/pdd_selection_spider.py`, so the project can run without starting Firecrawl. After Firecrawl is started and verified, switch `mall.selection.crawler.script` to `tools/external-services/firecrawl/firecrawl_selection_runner.py`.

## Data folders

- `data/raw/`: raw Firecrawl API responses, one JSON file per task.
- `data/normalized/`: cleaned product records before final export.
- `data/exports/`: JSONL/CSV files compatible with `SelectionProductDTO` and `selection_products`.
- `data/logs/`: task summaries and failure details.

Generated files in these folders are ignored by git; `.gitkeep` files keep the folder structure visible.

## Environment variables

- `FIRECRAWL_BASE_URL`: Firecrawl base URL. Default: `http://localhost:3002`.
- `FIRECRAWL_API_KEY`: optional API key if the service is protected.
- `FIRECRAWL_TIMEOUT`: request timeout in seconds. Default: `30`.
- `FIRECRAWL_ENABLED`: set to `true` only when the local Firecrawl service is running.

## Manual smoke commands

Keep using the safe simulator while Firecrawl is not running:

```powershell
python tools/crawler/pdd_selection_spider.py --task-id demo --category-id 101 --keyword snacks --limit 3 --output work/demo-selection.jsonl
```

After Firecrawl is running:

```powershell
$env:FIRECRAWL_ENABLED='true'
$env:FIRECRAWL_BASE_URL='http://localhost:3002'
python tools/external-services/firecrawl/firecrawl_selection_runner.py --task-id firecrawl-demo --category-id 101 --keyword snacks --limit 5 --output work/firecrawl-selection.jsonl
```

## Output contract

Each exported product row uses the fields consumed by the current selection backend:

- `category_id`
- `platform`
- `source_product_id`
- `product_name`
- `image_url`
- `source_url`
- `sales_7d`
- `avg_price`
- `profit_estimate`
- `trend_tag`
- `competition_level`
- `rank_no`
- `fetched_at`

If a page does not expose sales, review count, or rank evidence, the adapter leaves the value empty or estimated and records evidence in the intermediate normalized file. The plugin must not fabricate invisible page data as real platform facts.
