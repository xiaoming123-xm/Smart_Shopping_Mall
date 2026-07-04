-- 认证模块：后台管理员账号
-- 对应 com.smartmall.auth.domain.model.AdminUser
CREATE TABLE IF NOT EXISTS auth_admin_user (
    id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    username      VARCHAR(64)  NOT NULL COMMENT '登录用户名',
    password_hash VARCHAR(128) NOT NULL COMMENT '密码(演示为明文,生产应为 BCrypt)',
    nickname      VARCHAR(64)           DEFAULT NULL COMMENT '昵称',
    enabled       TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '是否启用 1启用 0禁用',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='后台管理员';

INSERT INTO auth_admin_user (username, password_hash, nickname, enabled) VALUES
    ('admin',    '123456', '超级管理员', 1),
    ('operator', '123456', '运营专员',   1);
