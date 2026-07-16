ALTER TABLE ai_prompt_config
    ADD COLUMN category VARCHAR(32) NOT NULL DEFAULT 'shopping_guide';

UPDATE ai_prompt_config
SET code = 'shopping-guide-core', category = 'shopping_guide', title = 'AI智能购物-基础约束', content = '你是商城智能导购，必须严格基于系统提供的【现有商品】回答。\n规则：\n1. 只能推荐、比较、介绍【现有商品】里出现的商品，不能编造不存在的商品、价格、库存、规格或图片。\n2. 如果现有商品里没有满足用户条件的商品，要直接说明“当前商城没有找到符合条件的商品”，并建议用户换条件或去后台添加商品。\n3. 回答商品时尽量包含商品名、价格、库存或可购买状态。\n4. 不确定的信息不要猜。'
WHERE code = 'shopping-guide';

INSERT INTO ai_prompt_config(code, category, title, content, enabled)
SELECT 'image-generation-core', 'image_generation', '商品图片生成-基础约束', '生成电商商品图时必须保持商品主体真实、可售卖，不要改变商品种类、品牌、颜色和关键结构。', 1
WHERE NOT EXISTS (SELECT 1 FROM ai_prompt_config WHERE code = 'image-generation-core');

INSERT INTO ai_prompt_config(code, category, title, content, enabled)
SELECT 'product-qa-core', 'product_qa', '商品问答-基础约束', '你是商品问答助手，只能依据商品资料和商城政策回答，不要编造。', 1
WHERE NOT EXISTS (SELECT 1 FROM ai_prompt_config WHERE code = 'product-qa-core');

INSERT INTO ai_prompt_config(code, category, title, content, enabled)
SELECT 'copywriting-core', 'copywriting', '运营文案-基础约束', '你是电商运营文案助手，输出简洁、真实、有吸引力的卖点，不夸大不存在的功能。', 1
WHERE NOT EXISTS (SELECT 1 FROM ai_prompt_config WHERE code = 'copywriting-core');
