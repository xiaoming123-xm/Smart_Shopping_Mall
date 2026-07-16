ALTER TABLE ai_generation_tasks
    MODIFY COLUMN request_payload LONGTEXT NULL COMMENT '生成请求快照，base64 素材改为摘要后保存';

ALTER TABLE ai_generated_assets
    MODIFY COLUMN source_urls LONGTEXT NULL COMMENT '输入素材地址列表，base64 素材改为摘要后保存',
    MODIFY COLUMN output_url LONGTEXT NOT NULL COMMENT '生成结果地址或 data URL',
    MODIFY COLUMN prompt LONGTEXT NULL COMMENT '生成时使用的提示词';
