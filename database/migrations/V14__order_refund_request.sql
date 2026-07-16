-- 订单退货/退款申请：只记录用户申请，商家处理后才可退款或入库
SET @sql = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE shop_order ADD COLUMN refund_reason VARCHAR(255) NULL COMMENT ''用户申请退款/退货原因，等待商家处理'' AFTER review_replied_at',
        'DO 0')
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'shop_order' AND column_name = 'refund_reason'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE shop_order ADD COLUMN refund_requested_at DATETIME NULL COMMENT ''用户申请退款/退货时间'' AFTER refund_reason',
        'DO 0')
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'shop_order' AND column_name = 'refund_requested_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE shop_order
    MODIFY status VARCHAR(32) NOT NULL DEFAULT 'CREATED'
    COMMENT 'CREATED待付款/PAID待发货/SHIPPED待收货/RECEIVED待评价/COMPLETED已完成/CANCELLED已取消/REFUND_REQUESTED用户已申请退款退货等待商家处理';
