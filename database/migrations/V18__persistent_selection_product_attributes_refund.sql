-- 商品属性、选品中心、退货处理持久化增强

SET @sql = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE catalog_spu ADD COLUMN attributes_json TEXT NULL COMMENT ''商品属性JSON，例如颜色、尺码、材质等'' AFTER description',
        'DO 0')
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'catalog_spu' AND column_name = 'attributes_json'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE shop_order ADD COLUMN refund_handle_note VARCHAR(255) NULL COMMENT ''商家退款处理备注'' AFTER refund_requested_at',
        'DO 0')
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'shop_order' AND column_name = 'refund_handle_note'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE shop_order ADD COLUMN refund_handled_at DATETIME NULL COMMENT ''商家退款处理时间'' AFTER refund_handle_note',
        'DO 0')
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'shop_order' AND column_name = 'refund_handled_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE shop_order
    MODIFY status VARCHAR(32) NOT NULL DEFAULT 'CREATED'
    COMMENT 'CREATED待付款/PAID待发货/SHIPPED待收货/RECEIVED待评价/COMPLETED已完成/CANCELLED已取消/REFUND_REQUESTED退货申请中/REFUNDED已退款/REFUND_REJECTED退货已拒绝';

CREATE TABLE IF NOT EXISTS selection_category (
    id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    category_name VARCHAR(64) NOT NULL,
    keyword VARCHAR(128) NULL,
    level INT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_selection_category_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='选品分类';

CREATE TABLE IF NOT EXISTS selection_product (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    platform VARCHAR(32) NOT NULL DEFAULT 'PDD',
    source_product_id VARCHAR(128) NULL,
    product_name VARCHAR(255) NOT NULL,
    image_url TEXT NULL,
    source_url TEXT NULL,
    sales_7d INT NOT NULL DEFAULT 0 COMMENT '近7天销量/已售数量',
    avg_price DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '单价/均价',
    sales_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '销量乘单价得到的成交额估算',
    profit_estimate DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    trend_tag VARCHAR(64) NULL,
    competition_level VARCHAR(16) NULL,
    rank_no INT NOT NULL DEFAULT 0,
    fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    task_id VARCHAR(64) NULL,
    PRIMARY KEY (id),
    KEY idx_selection_product_category (category_id),
    KEY idx_selection_product_task (task_id),
    KEY idx_selection_product_sales (sales_7d)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='选品抓取商品';

CREATE TABLE IF NOT EXISTS selection_crawler_task (
    task_id VARCHAR(64) NOT NULL,
    platform VARCHAR(32) NOT NULL DEFAULT 'PDD',
    category_id BIGINT NULL,
    keyword VARCHAR(128) NULL,
    status VARCHAR(32) NOT NULL,
    trigger_type VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
    started_at DATETIME NULL,
    finished_at DATETIME NULL,
    total_count INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    fail_reason VARCHAR(500) NULL,
    retry_count INT NOT NULL DEFAULT 0,
    anti_crawl_status VARCHAR(64) NULL,
    anomaly_count INT NOT NULL DEFAULT 0,
    block_signal_count INT NOT NULL DEFAULT 0,
    backoff_count INT NOT NULL DEFAULT 0,
    proxy_enabled TINYINT(1) NULL,
    observed_user_agent VARCHAR(255) NULL,
    avg_delay_ms DECIMAL(12,2) NULL,
    max_delay_ms DECIMAL(12,2) NULL,
    anti_crawl_evidence TEXT NULL,
    created_by VARCHAR(64) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id),
    KEY idx_selection_task_category_status (category_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='选品爬取任务';

INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 1, NULL, '食品饮料', '食品 饮料', 1, 1, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 1);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 2, NULL, '日用百货', '日用 百货', 1, 2, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 2);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 3, NULL, '服饰鞋包', '服饰 鞋包', 1, 3, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 3);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 4, NULL, '数码家电', '数码 家电', 1, 4, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 4);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 5, NULL, '母婴用品', '母婴 用品', 1, 5, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 5);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 6, NULL, '美妆个护', '美妆 个护', 1, 6, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 6);

INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 101, 1, '休闲零食', '零食', 2, 1, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 101);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 102, 1, '冲调饮品', '饮品', 2, 2, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 102);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 201, 2, '清洁纸品', '纸巾 清洁', 2, 1, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 201);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 202, 2, '灭蚊驱虫', '蚊子 灭蚊 驱蚊 蚊香 花露水 电蚊拍', 2, 2, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 202);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 301, 3, '衬衫', '衬衫', 2, 1, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 301);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 302, 3, '羽绒服', '羽绒服', 2, 2, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 302);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 401, 4, '手机配件', '手机配件', 2, 1, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 401);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 402, 4, '小家电', '小家电', 2, 2, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 402);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 501, 5, '婴童洗护', '婴童洗护', 2, 1, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 501);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 502, 5, '玩具早教', '玩具', 2, 2, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 502);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 601, 6, '护肤套装', '护肤', 2, 1, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 601);
INSERT INTO selection_category(id, parent_id, category_name, keyword, level, sort_order, enabled)
SELECT 602, 6, '彩妆香氛', '彩妆', 2, 2, 1 WHERE NOT EXISTS (SELECT 1 FROM selection_category WHERE id = 602);
