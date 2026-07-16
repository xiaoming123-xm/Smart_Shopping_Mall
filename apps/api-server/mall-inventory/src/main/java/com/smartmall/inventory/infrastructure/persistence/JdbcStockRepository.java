package com.smartmall.inventory.infrastructure.persistence;

import com.smartmall.inventory.domain.model.Stock;
import com.smartmall.inventory.domain.model.StockRecord;
import com.smartmall.inventory.domain.repository.StockRepository;
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
public class JdbcStockRepository implements StockRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<Stock> stockMapper = (rs, rowNum) -> {
        Stock stock = new Stock();
        stock.setId(rs.getLong("id"));
        stock.setSkuId(rs.getLong("sku_id"));
        stock.setSkuCode(rs.getString("sku_code"));
        stock.setQuantity(rs.getInt("quantity"));
        stock.setWarnThreshold(rs.getInt("warn_threshold"));
        stock.setCostPrice(rs.getBigDecimal("cost_price"));
        var updatedAt = rs.getTimestamp("updated_at");
        stock.setUpdatedAt(updatedAt == null ? null : updatedAt.toLocalDateTime());
        return stock;
    };

    private final RowMapper<StockRecord> recordMapper = (rs, rowNum) -> {
        StockRecord record = new StockRecord();
        record.setId(rs.getLong("id"));
        record.setSkuId(rs.getLong("sku_id"));
        record.setType(rs.getString("type"));
        record.setChange(rs.getInt("change_qty"));
        record.setAfter(rs.getInt("after_qty"));
        record.setRemark(rs.getString("remark"));
        var createdAt = rs.getTimestamp("created_at");
        record.setCreatedAt(createdAt == null ? null : createdAt.toLocalDateTime());
        return record;
    };

    public JdbcStockRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Stock save(Stock stock) {
        if (stock.getId() == null) {
            KeyHolder holder = new GeneratedKeyHolder();
            jdbc.update(conn -> {
                PreparedStatement ps = conn.prepareStatement(
                        """
                        INSERT INTO inventory_stock(sku_id, sku_code, quantity, warn_threshold, cost_price)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        Statement.RETURN_GENERATED_KEYS
                );
                bindStock(ps, stock);
                return ps;
            }, holder);
            stock.setId(holder.getKey().longValue());
            return findById(stock.getId()).orElse(stock);
        }

        jdbc.update(
                """
                UPDATE inventory_stock
                SET sku_id=?, sku_code=?, quantity=?, warn_threshold=?, cost_price=?
                WHERE id=?
                """,
                stock.getSkuId(),
                stock.getSkuCode(),
                stock.getQuantity(),
                stock.getWarnThreshold(),
                stock.getCostPrice(),
                stock.getId()
        );
        return findById(stock.getId()).orElse(stock);
    }

    private void bindStock(PreparedStatement ps, Stock stock) throws java.sql.SQLException {
        ps.setLong(1, stock.getSkuId());
        ps.setString(2, stock.getSkuCode());
        ps.setInt(3, stock.getQuantity());
        ps.setInt(4, stock.getWarnThreshold());
        ps.setBigDecimal(5, stock.getCostPrice());
    }

    @Override
    public Optional<Stock> findById(Long id) {
        return jdbc.query("SELECT * FROM inventory_stock WHERE id=?", stockMapper, id).stream().findFirst();
    }

    @Override
    public Optional<Stock> findBySkuId(Long skuId) {
        return jdbc.query("SELECT * FROM inventory_stock WHERE sku_id=?", stockMapper, skuId).stream().findFirst();
    }

    @Override
    public List<Stock> findAll() {
        return jdbc.query("SELECT * FROM inventory_stock ORDER BY sku_id ASC", stockMapper);
    }

    @Override
    public StockRecord addRecord(StockRecord record) {
        KeyHolder holder = new GeneratedKeyHolder();
        jdbc.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(
                    """
                    INSERT INTO inventory_stock_record(sku_id, type, change_qty, after_qty, remark)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, record.getSkuId());
            ps.setString(2, record.getType());
            ps.setInt(3, record.getChange());
            ps.setInt(4, record.getAfter());
            ps.setString(5, record.getRemark());
            return ps;
        }, holder);
        record.setId(holder.getKey().longValue());
        return jdbc.query("SELECT * FROM inventory_stock_record WHERE id=?", recordMapper, record.getId()).stream().findFirst().orElse(record);
    }

    @Override
    public List<StockRecord> findRecordsBySkuId(Long skuId) {
        return jdbc.query(
                "SELECT * FROM inventory_stock_record WHERE sku_id=? ORDER BY id DESC",
                recordMapper,
                skuId
        );
    }
}
