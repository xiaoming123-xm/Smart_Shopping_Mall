-- 支付模块：资金单(独立于业务单/订单)
-- 对应 com.smartmall.payment.domain.model.Payment

CREATE TABLE IF NOT EXISTS pay_payment (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    payment_no VARCHAR(64)   NOT NULL COMMENT '资金单号',
    order_id   BIGINT        NOT NULL COMMENT '关联业务单(订单)',
    channel    VARCHAR(16)   NOT NULL DEFAULT 'MOCK' COMMENT 'ALIPAY/WECHAT/MOCK',
    status     VARCHAR(16)   NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/PAID/REFUNDING/REFUNDED',
    amount     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at    DATETIME               DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_payment_no (payment_no),
    KEY idx_payment_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付资金单';
