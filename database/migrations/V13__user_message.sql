CREATE TABLE IF NOT EXISTS user_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
    member_id BIGINT NOT NULL COMMENT '用户ID，当前演示用户默认为1',
    order_id BIGINT NULL COMMENT '关联订单ID，没有关联订单时为空',
    business_key VARCHAR(100) NOT NULL COMMENT '业务唯一键，用于防止同一事件重复生成消息',
    type VARCHAR(32) NOT NULL COMMENT '消息类型：REVIEW_REPLY商家回复，ORDER_STATUS订单状态，LOGISTICS物流动态',
    title VARCHAR(200) NOT NULL COMMENT '消息标题，用户端消息列表展示',
    content TEXT NOT NULL COMMENT '消息内容，例如商家回复给用户的具体文字',
    action_text VARCHAR(50) NULL COMMENT '操作按钮文案，例如查看订单',
    action_url VARCHAR(255) NULL COMMENT '操作跳转地址，例如/order',
    read_flag TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：0未读，1已读',
    visible TINYINT NOT NULL DEFAULT 1 COMMENT '是否在用户端显示：1显示，0隐藏',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '消息创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '消息更新时间',
    UNIQUE KEY uk_user_message_business_key (business_key),
    KEY idx_user_message_member_visible (member_id, visible, created_at),
    KEY idx_user_message_order (order_id)
) COMMENT='用户消息表，持久化展示给用户的订单状态、物流动态和商家回复等通知';
