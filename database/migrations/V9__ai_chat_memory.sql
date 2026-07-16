CREATE TABLE IF NOT EXISTS ai_chat_message (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    member_id  BIGINT       NOT NULL,
    role       VARCHAR(32)  NOT NULL,
    message    TEXT         NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ai_chat_member_time (member_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI聊天记录';

CREATE TABLE IF NOT EXISTS ai_user_preference (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    member_id        BIGINT       NOT NULL,
    preference_key   VARCHAR(64)  NOT NULL,
    preference_value VARCHAR(255) NOT NULL,
    source_text      VARCHAR(500)          DEFAULT NULL,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ai_preference_member_key (member_id, preference_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI用户偏好记忆';
