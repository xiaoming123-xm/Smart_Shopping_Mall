-- 选品中心与 AI 内容生成增补表。

CREATE TABLE IF NOT EXISTS selection_categories (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    parent_id     BIGINT                DEFAULT NULL,
    category_name VARCHAR(64)  NOT NULL,
    keyword       VARCHAR(128)          DEFAULT NULL,
    level         INT          NOT NULL DEFAULT 1,
    sort_order    INT          NOT NULL DEFAULT 0,
    enabled       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_selection_category_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='选品分类';

CREATE TABLE IF NOT EXISTS selection_products (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    category_id        BIGINT        NOT NULL,
    platform           VARCHAR(32)   NOT NULL DEFAULT 'PDD',
    source_product_id  VARCHAR(128)           DEFAULT NULL,
    product_name       VARCHAR(255)  NOT NULL,
    image_url          VARCHAR(512)           DEFAULT NULL,
    source_url         VARCHAR(512)           DEFAULT NULL,
    sales_7d           INT          NOT NULL DEFAULT 0,
    avg_price          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    profit_estimate    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    trend_tag          VARCHAR(32)            DEFAULT NULL,
    competition_level  VARCHAR(16)            DEFAULT NULL,
    rank_no            INT          NOT NULL DEFAULT 0,
    fetched_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_selection_product_category (category_id),
    KEY idx_selection_product_sales (sales_7d),
    KEY idx_selection_product_profit (profit_estimate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='选品商品榜单';

CREATE TABLE IF NOT EXISTS selection_crawler_tasks (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    task_id       VARCHAR(64)  NOT NULL,
    platform      VARCHAR(32)  NOT NULL DEFAULT 'PDD',
    category_id   BIGINT                DEFAULT NULL,
    keyword       VARCHAR(128)          DEFAULT NULL,
    status        VARCHAR(24)  NOT NULL,
    trigger_type  VARCHAR(24)  NOT NULL DEFAULT 'MANUAL',
    started_at    DATETIME              DEFAULT NULL,
    finished_at   DATETIME              DEFAULT NULL,
    total_count   INT          NOT NULL DEFAULT 0,
    success_count INT          NOT NULL DEFAULT 0,
    fail_reason   VARCHAR(512)          DEFAULT NULL,
    retry_count   INT          NOT NULL DEFAULT 0,
    created_by    VARCHAR(64)           DEFAULT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_selection_crawler_task_id (task_id),
    KEY idx_selection_crawler_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='选品抓取任务';

CREATE TABLE IF NOT EXISTS ai_generation_tasks (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    task_id         VARCHAR(64)  NOT NULL,
    product_id      BIGINT       NOT NULL,
    task_type       VARCHAR(24)  NOT NULL COMMENT 'IMAGE/VIDEO',
    status          VARCHAR(24)  NOT NULL,
    progress        INT          NOT NULL DEFAULT 0,
    provider        VARCHAR(64)           DEFAULT NULL,
    request_payload TEXT                  DEFAULT NULL,
    fail_reason     VARCHAR(512)          DEFAULT NULL,
    created_by      VARCHAR(64)           DEFAULT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ai_generation_task_id (task_id),
    KEY idx_ai_generation_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 内容生成任务';

CREATE TABLE IF NOT EXISTS ai_generated_assets (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    task_id     VARCHAR(64)  NOT NULL,
    product_id  BIGINT       NOT NULL,
    asset_type  VARCHAR(24)  NOT NULL COMMENT 'IMAGE/VIDEO',
    source_urls TEXT                  DEFAULT NULL,
    output_url  VARCHAR(512) NOT NULL,
    prompt      TEXT                  DEFAULT NULL,
    mode        VARCHAR(64)           DEFAULT NULL,
    template    VARCHAR(64)           DEFAULT NULL,
    created_by  VARCHAR(64)           DEFAULT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ai_asset_task (task_id),
    KEY idx_ai_asset_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 生成资源';
