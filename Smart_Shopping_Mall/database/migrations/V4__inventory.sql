-- 库存模块：库存 + 库存流水
-- 对应 com.smartmall.inventory.domain.model.*

CREATE TABLE IF NOT EXISTS inventory_stock (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    sku_id         BIGINT        NOT NULL COMMENT '关联SKU',
    sku_code       VARCHAR(64)            DEFAULT NULL,
    quantity       INT           NOT NULL DEFAULT 0 COMMENT '可用库存',
    warn_threshold INT           NOT NULL DEFAULT 0 COMMENT '预警阈值',
    cost_price     DECIMAL(12,2)          DEFAULT NULL COMMENT '库存成本单价(财务增强:资金占用)',
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_stock_sku (sku_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存';

CREATE TABLE IF NOT EXISTS inventory_stock_record (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    sku_id     BIGINT       NOT NULL,
    type       VARCHAR(8)   NOT NULL COMMENT 'IN入库 OUT出库',
    change_qty INT          NOT NULL COMMENT '变更数量(正负)',
    after_qty  INT          NOT NULL COMMENT '变更后库存',
    remark     VARCHAR(255)          DEFAULT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_record_sku (sku_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存流水';
