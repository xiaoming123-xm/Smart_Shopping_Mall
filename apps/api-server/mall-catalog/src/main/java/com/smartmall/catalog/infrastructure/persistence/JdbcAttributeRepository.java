package com.smartmall.catalog.infrastructure.persistence;

import com.smartmall.catalog.domain.model.Attribute;
import com.smartmall.catalog.domain.model.AttributeValue;
import com.smartmall.catalog.domain.repository.AttributeRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
@Profile("local")
public class JdbcAttributeRepository implements AttributeRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<Attribute> attributeMapper = (rs, rowNum) -> {
        Attribute a = new Attribute();
        a.setId(rs.getLong("id"));
        a.setParentId(rs.getObject("parent_id") == null ? null : rs.getLong("parent_id"));
        a.setName(rs.getString("name"));
        a.setType(rs.getString("type"));
        a.setSearchable(rs.getBoolean("searchable"));
        a.setRequired(rs.getBoolean("required"));
        a.setSort(rs.getInt("sort"));
        var createdAt = rs.getTimestamp("created_at");
        var updatedAt = rs.getTimestamp("updated_at");
        a.setCreatedAt(createdAt == null ? null : createdAt.toLocalDateTime());
        a.setUpdatedAt(updatedAt == null ? null : updatedAt.toLocalDateTime());
        return a;
    };

    private final RowMapper<AttributeValue> valueMapper = (rs, rowNum) -> {
        AttributeValue v = new AttributeValue();
        v.setId(rs.getLong("id"));
        v.setAttrId(rs.getLong("attr_id"));
        v.setValue(rs.getString("value"));
        v.setSort(rs.getInt("sort"));
        return v;
    };

    public JdbcAttributeRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Attribute save(Attribute a) {
        if (a.getId() == null) {
            KeyHolder kh = new GeneratedKeyHolder();
            jdbc.update(conn -> {
                PreparedStatement ps = conn.prepareStatement("""
                        INSERT INTO catalog_attribute(parent_id, name, type, searchable, required, sort)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """, Statement.RETURN_GENERATED_KEYS);
                ps.setObject(1, normalizeParentId(a.getParentId()));
                ps.setString(2, a.getName());
                ps.setString(3, normalizeType(a.getType()));
                ps.setInt(4, Boolean.TRUE.equals(a.getSearchable()) ? 1 : 0);
                ps.setInt(5, Boolean.TRUE.equals(a.getRequired()) ? 1 : 0);
                ps.setObject(6, a.getSort() == null ? 0 : a.getSort());
                return ps;
            }, kh);
            a.setId(kh.getKey().longValue());
            return findById(a.getId()).orElse(a);
        }
        jdbc.update("""
                UPDATE catalog_attribute
                SET parent_id=?, name=?, type=?, searchable=?, required=?, sort=?
                WHERE id=?
                """, normalizeParentId(a.getParentId()), a.getName(), normalizeType(a.getType()), Boolean.TRUE.equals(a.getSearchable()) ? 1 : 0,
                Boolean.TRUE.equals(a.getRequired()) ? 1 : 0, a.getSort() == null ? 0 : a.getSort(), a.getId());
        return findById(a.getId()).orElse(a);
    }

    @Override
    public Optional<Attribute> findById(Long id) {
        return jdbc.query("SELECT * FROM catalog_attribute WHERE id=?", attributeMapper, id).stream().findFirst();
    }

    @Override
    public List<Attribute> findAll() {
        return jdbc.query("SELECT * FROM catalog_attribute ORDER BY COALESCE(parent_id, 0) ASC, sort ASC, id ASC", attributeMapper);
    }

    @Override
    public void deleteById(Long id) {
        jdbc.update("DELETE FROM catalog_category_attribute WHERE attr_id=?", id);
        jdbc.update("DELETE FROM catalog_attribute_value WHERE attr_id=?", id);
        jdbc.update("DELETE FROM catalog_attribute WHERE id=?", id);
    }

    @Override
    public AttributeValue saveValue(AttributeValue v) {
        if (v.getId() == null) {
            KeyHolder kh = new GeneratedKeyHolder();
            jdbc.update(conn -> {
                PreparedStatement ps = conn.prepareStatement("""
                        INSERT INTO catalog_attribute_value(attr_id, value, sort)
                        VALUES (?, ?, ?)
                        """, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, v.getAttrId());
                ps.setString(2, v.getValue());
                ps.setObject(3, v.getSort() == null ? 0 : v.getSort());
                return ps;
            }, kh);
            v.setId(kh.getKey().longValue());
            return findValueById(v.getId()).orElse(v);
        }
        jdbc.update("UPDATE catalog_attribute_value SET value=?, sort=? WHERE id=?", v.getValue(), v.getSort(), v.getId());
        return findValueById(v.getId()).orElse(v);
    }

    @Override
    public List<AttributeValue> findValuesByAttrId(Long attrId) {
        return jdbc.query("SELECT * FROM catalog_attribute_value WHERE attr_id=? ORDER BY sort ASC, id ASC", valueMapper, attrId);
    }

    @Override
    public void deleteValue(Long id) {
        jdbc.update("DELETE FROM catalog_attribute_value WHERE id=?", id);
    }

    @Override
    public boolean existsByParentId(Long parentId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM catalog_attribute WHERE parent_id=?", Integer.class, parentId);
        return count != null && count > 0;
    }

    @Override
    public boolean existsCategoryLinkByAttrId(Long attrId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM catalog_category_attribute WHERE attr_id=?", Integer.class, attrId);
        return count != null && count > 0;
    }

    @Override
    public List<Long> findCategoryIdsByAttrId(Long attrId) {
        return jdbc.query("SELECT category_id FROM catalog_category_attribute WHERE attr_id=? ORDER BY category_id ASC", (rs, rowNum) -> rs.getLong("category_id"), attrId);
    }

    @Override
    public void replaceCategoryLinks(Long attrId, List<Long> categoryIds) {
        jdbc.update("DELETE FROM catalog_category_attribute WHERE attr_id=?", attrId);
        for (Long categoryId : categoryIds) {
            jdbc.update("INSERT INTO catalog_category_attribute(category_id, attr_id) VALUES (?, ?)", categoryId, attrId);
        }
    }

    private Optional<AttributeValue> findValueById(Long id) {
        return jdbc.query("SELECT * FROM catalog_attribute_value WHERE id=?", valueMapper, id).stream().findFirst();
    }

    private Long normalizeParentId(Long parentId) {
        return parentId == null || parentId == 0L ? null : parentId;
    }

    private String normalizeType(String type) {
        if (type == null || type.isBlank()) {
            return "SELECT";
        }
        return type.trim().toUpperCase();
    }
}
