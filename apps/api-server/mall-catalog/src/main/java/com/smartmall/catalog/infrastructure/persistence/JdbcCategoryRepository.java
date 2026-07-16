package com.smartmall.catalog.infrastructure.persistence;

import com.smartmall.catalog.domain.model.Category;
import com.smartmall.catalog.domain.repository.CategoryRepository;
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
public class JdbcCategoryRepository implements CategoryRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<Category> mapper = (rs, rowNum) -> {
        Category c = new Category();
        c.setId(rs.getLong("id"));
        c.setParentId(rs.getLong("parent_id"));
        c.setName(rs.getString("name"));
        c.setSort(rs.getInt("sort"));
        c.setEnabled(rs.getBoolean("enabled"));
        var createdAt = rs.getTimestamp("created_at");
        var updatedAt = rs.getTimestamp("updated_at");
        c.setCreatedAt(createdAt == null ? null : createdAt.toLocalDateTime());
        c.setUpdatedAt(updatedAt == null ? null : updatedAt.toLocalDateTime());
        return c;
    };

    public JdbcCategoryRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Category save(Category category) {
        if (category.getId() == null) {
            KeyHolder kh = new GeneratedKeyHolder();
            jdbc.update(conn -> {
                PreparedStatement ps = conn.prepareStatement("""
                        INSERT INTO catalog_category(parent_id, name, sort, enabled)
                        VALUES (?, ?, ?, ?)
                        """, Statement.RETURN_GENERATED_KEYS);
                ps.setObject(1, category.getParentId() == null ? 0L : category.getParentId());
                ps.setString(2, category.getName());
                ps.setObject(3, category.getSort() == null ? 0 : category.getSort());
                ps.setObject(4, Boolean.TRUE.equals(category.getEnabled()) ? 1 : 0);
                return ps;
            }, kh);
            category.setId(kh.getKey().longValue());
            return findById(category.getId()).orElse(category);
        }
        jdbc.update("""
                UPDATE catalog_category
                SET name=?, sort=?, enabled=?
                WHERE id=?
                """, category.getName(), category.getSort(), Boolean.TRUE.equals(category.getEnabled()) ? 1 : 0, category.getId());
        return findById(category.getId()).orElse(category);
    }

    @Override
    public Optional<Category> findById(Long id) {
        return jdbc.query("SELECT * FROM catalog_category WHERE id=?", mapper, id).stream().findFirst();
    }

    @Override
    public List<Category> findAll() {
        return jdbc.query("SELECT * FROM catalog_category ORDER BY sort ASC, id ASC", mapper);
    }

    @Override
    public List<Category> findByParentId(Long parentId) {
        Long pid = parentId == null ? 0L : parentId;
        return jdbc.query("SELECT * FROM catalog_category WHERE parent_id=? ORDER BY sort ASC, id ASC", mapper, pid);
    }

    @Override
    public boolean existsByParentIdAndName(Long parentId, String name, Long excludeId) {
        Long pid = parentId == null ? 0L : parentId;
        Integer count;
        if (excludeId == null) {
            count = jdbc.queryForObject("SELECT COUNT(*) FROM catalog_category WHERE parent_id=? AND name=?", Integer.class, pid, name);
        } else {
            count = jdbc.queryForObject("SELECT COUNT(*) FROM catalog_category WHERE parent_id=? AND name=? AND id<>?", Integer.class, pid, name, excludeId);
        }
        return count != null && count > 0;
    }

    @Override
    public boolean existsByParentId(Long parentId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM catalog_category WHERE parent_id=?", Integer.class, parentId);
        return count != null && count > 0;
    }

    @Override
    public void deleteById(Long id) {
        jdbc.update("DELETE FROM catalog_category WHERE id=?", id);
    }
}
