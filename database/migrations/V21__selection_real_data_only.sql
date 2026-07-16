-- Remove generated/demo selection rows so the selection center only shows real sourced goods.
DELETE FROM selection_product
WHERE COALESCE(source_product_id, '') LIKE 'seed%'
   OR COALESCE(image_url, '') LIKE '%placehold.co%'
   OR product_name LIKE '%热销款%'
   OR product_name LIKE '%鐑%';

UPDATE selection_crawler_task
SET status = 'NO_REAL_DATA',
    success_count = 0,
    fail_reason = '历史演示选品数据已清理，请重新登录拼多多后抓取真实数据。'
WHERE task_id LIKE 'seed%'
   OR anti_crawl_status IS NULL
   OR anti_crawl_status = '';
