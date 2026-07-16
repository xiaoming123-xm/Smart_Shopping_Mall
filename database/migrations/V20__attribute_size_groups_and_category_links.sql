CREATE TABLE IF NOT EXISTS catalog_category_attribute (
    category_id BIGINT NOT NULL,
    attr_id BIGINT NOT NULL,
    PRIMARY KEY (category_id, attr_id),
    KEY idx_category_attribute_attr (attr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类属性关联';

SET @sql = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE catalog_attribute ADD COLUMN parent_id BIGINT NULL COMMENT ''父级属性ID，NULL表示顶级属性/分组'' AFTER id',
        'DO 0')
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'catalog_attribute' AND column_name = 'parent_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TEMPORARY TABLE tmp_attr_ids (
    name VARCHAR(64) PRIMARY KEY,
    id BIGINT NOT NULL
);

INSERT INTO catalog_attribute(parent_id, name, type, searchable, required, sort)
SELECT NULL, '尺码', 'GROUP', 0, 0, 20
WHERE NOT EXISTS (SELECT 1 FROM catalog_attribute WHERE name = '尺码' AND parent_id IS NULL);

INSERT INTO tmp_attr_ids(name, id)
SELECT '尺码', id FROM catalog_attribute WHERE name = '尺码' AND parent_id IS NULL ORDER BY id LIMIT 1;

INSERT INTO catalog_attribute(parent_id, name, type, searchable, required, sort)
SELECT p.id, '衣服尺码', 'SELECT', 1, 1, 1
FROM tmp_attr_ids p
WHERE p.name = '尺码'
  AND NOT EXISTS (SELECT 1 FROM catalog_attribute WHERE name = '衣服尺码');

INSERT INTO catalog_attribute(parent_id, name, type, searchable, required, sort)
SELECT p.id, '鞋子尺码', 'SELECT', 1, 1, 2
FROM tmp_attr_ids p
WHERE p.name = '尺码'
  AND NOT EXISTS (SELECT 1 FROM catalog_attribute WHERE name = '鞋子尺码');

UPDATE catalog_attribute a
JOIN tmp_attr_ids p ON p.name = '尺码'
SET a.parent_id = p.id, a.type = 'SELECT', a.searchable = 1, a.required = 1
WHERE a.name IN ('衣服尺码', '鞋子尺码') AND (a.parent_id IS NULL OR a.parent_id = 0);

INSERT INTO tmp_attr_ids(name, id)
SELECT '衣服尺码', id FROM catalog_attribute WHERE name = '衣服尺码' ORDER BY id LIMIT 1
ON DUPLICATE KEY UPDATE id = VALUES(id);

INSERT INTO tmp_attr_ids(name, id)
SELECT '鞋子尺码', id FROM catalog_attribute WHERE name = '鞋子尺码' ORDER BY id LIMIT 1
ON DUPLICATE KEY UPDATE id = VALUES(id);

INSERT INTO catalog_attribute_value(attr_id, value, sort)
SELECT a.id, v.value, v.sort
FROM tmp_attr_ids a
JOIN (
    SELECT '衣服尺码' AS name, 'XS' AS value, 1 AS sort UNION ALL
    SELECT '衣服尺码', 'S', 2 UNION ALL
    SELECT '衣服尺码', 'M', 3 UNION ALL
    SELECT '衣服尺码', 'L', 4 UNION ALL
    SELECT '衣服尺码', 'XL', 5 UNION ALL
    SELECT '衣服尺码', 'XXL', 6 UNION ALL
    SELECT '鞋子尺码', '35', 1 UNION ALL
    SELECT '鞋子尺码', '36', 2 UNION ALL
    SELECT '鞋子尺码', '37', 3 UNION ALL
    SELECT '鞋子尺码', '38', 4 UNION ALL
    SELECT '鞋子尺码', '39', 5 UNION ALL
    SELECT '鞋子尺码', '40', 6 UNION ALL
    SELECT '鞋子尺码', '41', 7 UNION ALL
    SELECT '鞋子尺码', '42', 8 UNION ALL
    SELECT '鞋子尺码', '43', 9 UNION ALL
    SELECT '鞋子尺码', '44', 10
) v ON v.name = a.name
LEFT JOIN catalog_attribute_value existing_v ON existing_v.attr_id = a.id AND existing_v.value = v.value
WHERE existing_v.id IS NULL;

INSERT INTO catalog_category_attribute(category_id, attr_id)
SELECT c.id, a.id
FROM catalog_category c
JOIN tmp_attr_ids a ON a.name = '衣服尺码'
LEFT JOIN catalog_category_attribute existing_link ON existing_link.category_id = c.id AND existing_link.attr_id = a.id
WHERE existing_link.attr_id IS NULL
  AND (c.name IN ('衬衫', '羽绒服') OR c.name LIKE '%服%' OR c.name LIKE '%衣%' OR c.name LIKE '%装%');

INSERT INTO catalog_category_attribute(category_id, attr_id)
SELECT c.id, a.id
FROM catalog_category c
JOIN tmp_attr_ids a ON a.name = '鞋子尺码'
LEFT JOIN catalog_category_attribute existing_link ON existing_link.category_id = c.id AND existing_link.attr_id = a.id
WHERE existing_link.attr_id IS NULL
  AND (c.name LIKE '%鞋%' OR c.name LIKE '%靴%');

DROP TEMPORARY TABLE tmp_attr_ids;
