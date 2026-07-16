-- 补齐颜色属性的白色默认值，并确保后续属性管理在 local/MySQL 下持久化。
INSERT INTO catalog_attribute_value(attr_id, value, sort)
SELECT a.id, '白色', COALESCE(v.max_sort + 1, 4)
FROM catalog_attribute a
LEFT JOIN (
    SELECT attr_id, MAX(sort) AS max_sort
    FROM catalog_attribute_value
    GROUP BY attr_id
) v ON v.attr_id = a.id
LEFT JOIN catalog_attribute_value existing_v
    ON existing_v.attr_id = a.id AND existing_v.value = '白色'
WHERE a.name = '颜色'
  AND existing_v.id IS NULL;
