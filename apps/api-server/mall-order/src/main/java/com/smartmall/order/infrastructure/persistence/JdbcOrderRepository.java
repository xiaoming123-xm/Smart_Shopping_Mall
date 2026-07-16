package com.smartmall.order.infrastructure.persistence;

import com.smartmall.order.domain.model.Order;
import com.smartmall.order.domain.model.OrderItem;
import com.smartmall.order.domain.repository.OrderRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
@Profile("local")
public class JdbcOrderRepository implements OrderRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<Order> orderMapper = (rs, rowNum) -> {
        Order order = new Order();
        order.setId(rs.getLong("id"));
        order.setOrderNo(rs.getString("order_no"));
        order.setMemberId((Long) rs.getObject("member_id"));
        order.setStatus(rs.getString("status"));
        order.setTotalAmount(rs.getBigDecimal("total_amount"));
        order.setReceiver(rs.getString("receiver"));
        order.setReceiverPhone(rs.getString("receiver_phone"));
        order.setAddress(rs.getString("address"));
        order.setSender(rs.getString("sender"));
        order.setSenderPhone(rs.getString("sender_phone"));
        order.setSenderAddress(rs.getString("sender_address"));
        order.setLogisticsCompany(rs.getString("logistics_company"));
        order.setTrackingNo(rs.getString("tracking_no"));
        order.setShippedAt(toLocalDateTime(rs.getTimestamp("shipped_at")));
        order.setReceivedAt(toLocalDateTime(rs.getTimestamp("received_at")));
        order.setRating((Integer) rs.getObject("rating"));
        order.setReviewContent(rs.getString("review_content"));
        order.setReviewedAt(toLocalDateTime(rs.getTimestamp("reviewed_at")));
        order.setReviewReply(rs.getString("review_reply"));
        order.setReviewRepliedAt(toLocalDateTime(rs.getTimestamp("review_replied_at")));
        order.setRefundReason(rs.getString("refund_reason"));
        order.setRefundRequestedAt(toLocalDateTime(rs.getTimestamp("refund_requested_at")));
        order.setRefundHandleNote(rs.getString("refund_handle_note"));
        order.setRefundHandledAt(toLocalDateTime(rs.getTimestamp("refund_handled_at")));
        order.setCreatedAt(toLocalDateTime(rs.getTimestamp("created_at")));
        return order;
    };

    private final RowMapper<OrderItem> itemMapper = (rs, rowNum) -> {
        OrderItem item = new OrderItem();
        item.setId(rs.getLong("id"));
        item.setOrderId(rs.getLong("order_id"));
        item.setSkuId(rs.getLong("sku_id"));
        item.setSkuCode(rs.getString("sku_code"));
        String displayProductName;
        try {
            displayProductName = rs.getString("display_product_name");
        } catch (java.sql.SQLException ignored) {
            displayProductName = null;
        }
        item.setProductName(displayProductName == null || displayProductName.isBlank() ? rs.getString("product_name") : displayProductName);
        item.setPrice(rs.getBigDecimal("price"));
        item.setQuantity(rs.getInt("quantity"));
        return item;
    };

    public JdbcOrderRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public Order save(Order order) {
        if (order.getId() == null) {
            insertOrder(order);
        } else {
            updateOrder(order);
            jdbc.update("DELETE FROM shop_order_item WHERE order_id=?", order.getId());
        }
        saveItems(order);
        return findById(order.getId()).orElse(order);
    }

    @Override
    public Optional<Order> findById(Long id) {
        return jdbc.query("SELECT * FROM shop_order WHERE id=?", orderMapper, id).stream()
                .findFirst()
                .map(this::attachItems);
    }

    @Override
    public List<Order> findAll() {
        return jdbc.query("SELECT * FROM shop_order ORDER BY id DESC", orderMapper)
                .stream()
                .map(this::attachItems)
                .toList();
    }

    private void insertOrder(Order order) {
        KeyHolder holder = new GeneratedKeyHolder();
        jdbc.update(conn -> {
            PreparedStatement ps = conn.prepareStatement("""
                    INSERT INTO shop_order(
                        order_no, member_id, status, total_amount, receiver, receiver_phone, address,
                        sender, sender_phone, sender_address, logistics_company, tracking_no,
                        shipped_at, received_at, rating, review_content, reviewed_at, review_reply, review_replied_at,
                        refund_reason, refund_requested_at, refund_handle_note, refund_handled_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            bindOrder(ps, order, false);
            return ps;
        }, holder);
        order.setId(holder.getKey().longValue());
    }

    private void updateOrder(Order order) {
        jdbc.update("""
                UPDATE shop_order
                SET order_no=?, member_id=?, status=?, total_amount=?, receiver=?, receiver_phone=?, address=?,
                    sender=?, sender_phone=?, sender_address=?, logistics_company=?, tracking_no=?,
                    shipped_at=?, received_at=?, rating=?, review_content=?, reviewed_at=?, review_reply=?, review_replied_at=?,
                    refund_reason=?, refund_requested_at=?, refund_handle_note=?, refund_handled_at=?
                WHERE id=?
                """,
                order.getOrderNo(),
                order.getMemberId(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getReceiver(),
                order.getReceiverPhone(),
                order.getAddress(),
                order.getSender(),
                order.getSenderPhone(),
                order.getSenderAddress(),
                order.getLogisticsCompany(),
                order.getTrackingNo(),
                toTimestamp(order.getShippedAt()),
                toTimestamp(order.getReceivedAt()),
                order.getRating(),
                order.getReviewContent(),
                toTimestamp(order.getReviewedAt()),
                order.getReviewReply(),
                toTimestamp(order.getReviewRepliedAt()),
                order.getRefundReason(),
                toTimestamp(order.getRefundRequestedAt()),
                order.getRefundHandleNote(),
                toTimestamp(order.getRefundHandledAt()),
                order.getId()
        );
    }

    private void bindOrder(PreparedStatement ps, Order order, boolean includeId) throws java.sql.SQLException {
        ps.setString(1, order.getOrderNo());
        ps.setObject(2, order.getMemberId());
        ps.setString(3, order.getStatus());
        ps.setBigDecimal(4, order.getTotalAmount());
        ps.setString(5, order.getReceiver());
        ps.setString(6, order.getReceiverPhone());
        ps.setString(7, order.getAddress());
        ps.setString(8, order.getSender());
        ps.setString(9, order.getSenderPhone());
        ps.setString(10, order.getSenderAddress());
        ps.setString(11, order.getLogisticsCompany());
        ps.setString(12, order.getTrackingNo());
        ps.setTimestamp(13, toTimestamp(order.getShippedAt()));
        ps.setTimestamp(14, toTimestamp(order.getReceivedAt()));
        ps.setObject(15, order.getRating());
        ps.setString(16, order.getReviewContent());
        ps.setTimestamp(17, toTimestamp(order.getReviewedAt()));
        ps.setString(18, order.getReviewReply());
        ps.setTimestamp(19, toTimestamp(order.getReviewRepliedAt()));
        ps.setString(20, order.getRefundReason());
        ps.setTimestamp(21, toTimestamp(order.getRefundRequestedAt()));
        ps.setString(22, order.getRefundHandleNote());
        ps.setTimestamp(23, toTimestamp(order.getRefundHandledAt()));
        if (includeId) {
            ps.setLong(24, order.getId());
        }
    }

    private void saveItems(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return;
        }
        for (OrderItem item : order.getItems()) {
            KeyHolder holder = new GeneratedKeyHolder();
            jdbc.update(conn -> {
                PreparedStatement ps = conn.prepareStatement("""
                        INSERT INTO shop_order_item(order_id, sku_id, sku_code, product_name, price, quantity)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, order.getId());
                ps.setLong(2, item.getSkuId());
                ps.setString(3, item.getSkuCode());
                ps.setString(4, item.getProductName());
                ps.setBigDecimal(5, item.getPrice());
                ps.setInt(6, item.getQuantity());
                return ps;
            }, holder);
            item.setId(holder.getKey().longValue());
            item.setOrderId(order.getId());
        }
    }

    private Order attachItems(Order order) {
        List<OrderItem> items = jdbc.query(
                """
                SELECT oi.*,
                       CASE
                           WHEN oi.product_name IS NULL OR oi.product_name = '' OR oi.product_name = '???' THEN sp.name
                           ELSE oi.product_name
                       END AS display_product_name
                FROM shop_order_item oi
                LEFT JOIN catalog_sku cs ON cs.id = oi.sku_id
                LEFT JOIN catalog_spu sp ON sp.id = cs.spu_id
                WHERE oi.order_id=?
                ORDER BY oi.id ASC
                """,
                itemMapper,
                order.getId()
        );
        order.setItems(items);
        return order;
    }

    private java.time.LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private Timestamp toTimestamp(java.time.LocalDateTime time) {
        return time == null ? null : Timestamp.valueOf(time);
    }
}
