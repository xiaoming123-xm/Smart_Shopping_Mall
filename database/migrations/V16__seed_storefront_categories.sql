-- Seed storefront root categories used by the left navigation.
INSERT INTO catalog_category(parent_id, name, sort, enabled)
SELECT 0, '数码家电', 10, 1
WHERE NOT EXISTS (SELECT 1 FROM catalog_category WHERE parent_id = 0 AND name = '数码家电');

INSERT INTO catalog_category(parent_id, name, sort, enabled)
SELECT 0, '服装鞋帽', 20, 1
WHERE NOT EXISTS (SELECT 1 FROM catalog_category WHERE parent_id = 0 AND name = '服装鞋帽');

INSERT INTO catalog_category(parent_id, name, sort, enabled)
SELECT 0, '美妆个护', 30, 1
WHERE NOT EXISTS (SELECT 1 FROM catalog_category WHERE parent_id = 0 AND name = '美妆个护');

INSERT INTO catalog_category(parent_id, name, sort, enabled)
SELECT 0, '家居生活', 40, 1
WHERE NOT EXISTS (SELECT 1 FROM catalog_category WHERE parent_id = 0 AND name = '家居生活');

INSERT INTO catalog_category(parent_id, name, sort, enabled)
SELECT 0, '食品生鲜', 50, 1
WHERE NOT EXISTS (SELECT 1 FROM catalog_category WHERE parent_id = 0 AND name = '食品生鲜');

INSERT INTO catalog_category(parent_id, name, sort, enabled)
SELECT 0, '文体娱乐', 60, 1
WHERE NOT EXISTS (SELECT 1 FROM catalog_category WHERE parent_id = 0 AND name = '文体娱乐');

INSERT INTO catalog_category(parent_id, name, sort, enabled)
SELECT 0, '其他', 70, 1
WHERE NOT EXISTS (SELECT 1 FROM catalog_category WHERE parent_id = 0 AND name = '其他');
