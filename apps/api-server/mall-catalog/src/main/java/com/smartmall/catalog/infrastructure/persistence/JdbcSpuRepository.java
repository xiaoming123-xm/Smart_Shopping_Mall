package com.smartmall.catalog.infrastructure.persistence;

import com.smartmall.catalog.domain.model.Sku;
import com.smartmall.catalog.domain.model.Spu;
import com.smartmall.catalog.domain.repository.SpuRepository;
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
@Profile("mysql")
public class JdbcSpuRepository implements SpuRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<Spu> spuMapper = (rs, rowNum) -> {
        Spu s = new Spu();
        s.setId(rs.getLong("id"));
        s.setName(rs.getString("name"));
        s.setCategoryId((Long) rs.getObject("category_id"));
        s.setBrandId((Long) rs.getObject("brand_id"));
        s.setMainImage(rs.getString("main_image"));
        s.setDescription(rs.getString("description"));
        s.setPrice(rs.getBigDecimal("price"));
        s.setCostPrice(rs.getBigDecimal("cost_price"));
        s.setStock(rs.getInt("stock"));
        s.setStatus(rs.getInt("status"));
        s.setSort(rs.getInt("sort"));
        var createdAt = rs.getTimestamp("created_at");
        var updatedAt = rs.getTimestamp("updated_at");
        s.setCreatedAt(createdAt == null ? null : createdAt.toLocalDateTime());
        s.setUpdatedAt(updatedAt == null ? null : updatedAt.toLocalDateTime());
        return s;
    };

    private final RowMapper<Sku> skuMapper = (rs, rowNum) -> {
        Sku s = new Sku();
        s.setId(rs.getLong("id"));
        s.setSpuId(rs.getLong("spu_id"));
        s.setSkuCode(rs.getString("sku_code"));
        s.setSpecs(rs.getString("specs"));
        s.setPrice(rs.getBigDecimal("price"));
        s.setCostPrice(rs.getBigDecimal("cost_price"));
        s.setStock(rs.getInt("stock"));
        s.setStatus(rs.getInt("status"));
        return s;
    };

    public JdbcSpuRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Spu save(Spu s) {
        if (s.getId() == null) {
            KeyHolder kh = new GeneratedKeyHolder();
            jdbc.update(conn -> {
                PreparedStatement ps = conn.prepareStatement("""
                        INSERT INTO catalog_spu(name, category_id, brand_id, main_image, description, price, cost_price, stock, status, sort)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, Statement.RETURN_GENERATED_KEYS);
                bindSpu(ps, s);
                return ps;
            }, kh);
            s.setId(kh.getKey().longValue());
            return findById(s.getId()).orElse(s);
        }
        jdbc.update("""
                UPDATE catalog_spu
                SET name=?, category_id=?, brand_id=?, main_image=?, description=?, price=?, cost_price=?, stock=?, status=?, sort=?
                WHERE id=?
                """, s.getName(), s.getCategoryId(), s.getBrandId(), s.getMainImage(), s.getDescription(),
                s.getPrice(), s.getCostPrice(), s.getStock(), s.getStatus(), s.getSort(), s.getId());
        return findById(s.getId()).orElse(s);
    }

    private void bindSpu(PreparedStatement ps, Spu s) throws java.sql.SQLException {
        ps.setString(1, s.getName());
        ps.setObject(2, s.getCategoryId());
        ps.setObject(3, s.getBrandId());
        ps.setString(4, s.getMainImage());
        ps.setString(5, s.getDescription());
        ps.setBigDecimal(6, s.getPrice());
        ps.setBigDecimal(7, s.getCostPrice());
        ps.setObject(8, s.getStock());
        ps.setObject(9, s.getStatus());
        ps.setObject(10, s.getSort());
    }

    @Override
    public Optional<Spu> findById(Long id) {
        return jdbc.query("SELECT * FROM catalog_spu WHERE id=?", spuMapper, id).stream().findFirst();
    }

    @Override
    public List<Spu> findAll() {
        return jdbc.query("SELECT * FROM catalog_spu ORDER BY sort ASC, id DESC", spuMapper);
    }

    @Override
    public void deleteById(Long id) {
        jdbc.update("DELETE FROM catalog_spu WHERE id=?", id);
    }

    @Override
    public Sku saveSku(Sku sku) {
        if (sku.getId() == null) {
            KeyHolder kh = new GeneratedKeyHolder();
            jdbc.update(conn -> {
                PreparedStatement ps = conn.prepareStatement("""
                        INSERT INTO catalog_sku(spu_id, sku_code, specs, price, cost_price, stock, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, sku.getSpuId());
                ps.setString(2, sku.getSkuCode());
                ps.setString(3, sku.getSpecs());
                ps.setBigDecimal(4, sku.getPrice());
                ps.setBigDecimal(5, sku.getCostPrice());
                ps.setObject(6, sku.getStock());
                ps.setObject(7, sku.getStatus());
                return ps;
            }, kh);
            sku.setId(kh.getKey().longValue());
            return findSkuById(sku.getId()).orElse(sku);
        }
        jdbc.update("""
                UPDATE catalog_sku
                SET spu_id=?, sku_code=?, specs=?, price=?, cost_price=?, stock=?, status=?
                WHERE id=?
                """, sku.getSpuId(), sku.getSkuCode(), sku.getSpecs(), sku.getPrice(), sku.getCostPrice(),
                sku.getStock(), sku.getStatus(), sku.getId());
        return findSkuById(sku.getId()).orElse(sku);
    }

    @Override
    public Optional<Sku> findSkuById(Long id) {
        return jdbc.query("SELECT * FROM catalog_sku WHERE id=?", skuMapper, id).stream().findFirst();
    }

    @Override
    public List<Sku> findSkusBySpuId(Long spuId) {
        return jdbc.query("SELECT * FROM catalog_sku WHERE spu_id=? ORDER BY id ASC", skuMapper, spuId);
    }

    @Override
    public void deleteSku(Long id) {
        jdbc.update("DELETE FROM catalog_sku WHERE id=?", id);
    }

    @Override
    public void deleteSkusBySpuId(Long spuId) {
        jdbc.update("DELETE FROM catalog_sku WHERE spu_id=?", spuId);
    }
}
