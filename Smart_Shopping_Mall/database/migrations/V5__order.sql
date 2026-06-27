-- 订单模块：订单 + 订单明细
-- 对应 com.smartmall.order.domain.model.*

CREATE TABLE IF NOT EXISTS shop_order (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    order_no     VARCHAR(64)   NOT NULL COMMENT '订单号(业务单)',
    member_id    BIGINT                 DEFAULT NULL,
    status       VARCHAR(16)   NOT NULL DEFAULT 'CREATED' COMMENT 'CREATED/PAID/SHIPPED/COMPLETED/CANCELLED',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    receiver     VARCHAR(64)            DEFAULT NULL,
    address      VARCHAR(255)           DEFAULT NULL,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单';

CREATE TABLE IF NOT EXISTS shop_order_item (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    order_id     BIGINT        NOT NULL,
    sku_id       BIGINT        NOT NULL,
    sku_code     VARCHAR(64)            DEFAULT NULL,
    product_name VARCHAR(128)           DEFAULT NULL,
    price        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    quantity     INT           NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY idx_item_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细';
