-- 系统管理：系统用户(角色/权限演示)
-- 对应 com.smartmall.system.domain.model.SysUser

CREATE TABLE IF NOT EXISTS sys_user (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    username   VARCHAR(64) NOT NULL,
    nickname   VARCHAR(64)          DEFAULT NULL,
    role       VARCHAR(16) NOT NULL DEFAULT 'OPERATOR' COMMENT 'ADMIN/OPERATOR',
    enabled    TINYINT(1)  NOT NULL DEFAULT 1,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_sys_user_name (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户';

INSERT INTO sys_user (username, nickname, role, enabled) VALUES
    ('admin',    '超级管理员', 'ADMIN',    1),
    ('operator', '运营专员',   'OPERATOR', 1);
