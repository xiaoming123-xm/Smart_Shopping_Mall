CREATE TABLE IF NOT EXISTS ai_prompt_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content LONGTEXT NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_ai_prompt_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 提示词配置';

INSERT INTO ai_prompt_config(code, title, content, enabled)
SELECT 'shopping-guide', 'AI智能购物提示词', '你是商城智能导购，基于以下事实回答，不要编造。', 1
WHERE NOT EXISTS (SELECT 1 FROM ai_prompt_config WHERE code = 'shopping-guide');
