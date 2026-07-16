package com.smartmall.payment.infrastructure.persistence;

import com.smartmall.payment.domain.model.Payment;
import com.smartmall.payment.domain.repository.PaymentRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
@Profile("local")
public class JdbcPaymentRepository implements PaymentRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<Payment> mapper = (rs, rowNum) -> {
        Payment payment = new Payment();
        payment.setId(rs.getLong("id"));
        payment.setPaymentNo(rs.getString("payment_no"));
        payment.setOrderId(rs.getLong("order_id"));
        payment.setChannel(rs.getString("channel"));
        payment.setStatus(rs.getString("status"));
        payment.setAmount(rs.getBigDecimal("amount"));
        payment.setCreatedAt(toLocalDateTime(rs.getTimestamp("created_at")));
        payment.setPaidAt(toLocalDateTime(rs.getTimestamp("paid_at")));
        return payment;
    };

    public JdbcPaymentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Payment save(Payment payment) {
        if (payment.getId() == null) {
            KeyHolder holder = new GeneratedKeyHolder();
            jdbc.update(conn -> {
                PreparedStatement ps = conn.prepareStatement("""
                        INSERT INTO pay_payment(payment_no, order_id, channel, status, amount, paid_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, payment.getPaymentNo());
                ps.setLong(2, payment.getOrderId());
                ps.setString(3, payment.getChannel());
                ps.setString(4, payment.getStatus());
                ps.setBigDecimal(5, payment.getAmount());
                ps.setTimestamp(6, toTimestamp(payment.getPaidAt()));
                return ps;
            }, holder);
            payment.setId(holder.getKey().longValue());
            return findById(payment.getId()).orElse(payment);
        }

        jdbc.update("""
                UPDATE pay_payment
                SET payment_no=?, order_id=?, channel=?, status=?, amount=?, paid_at=?
                WHERE id=?
                """,
                payment.getPaymentNo(),
                payment.getOrderId(),
                payment.getChannel(),
                payment.getStatus(),
                payment.getAmount(),
                toTimestamp(payment.getPaidAt()),
                payment.getId()
        );
        return findById(payment.getId()).orElse(payment);
    }

    @Override
    public Optional<Payment> findById(Long id) {
        return jdbc.query("SELECT * FROM pay_payment WHERE id=?", mapper, id).stream().findFirst();
    }

    @Override
    public Optional<Payment> findByOrderId(Long orderId) {
        return jdbc.query("SELECT * FROM pay_payment WHERE order_id=? ORDER BY id DESC LIMIT 1", mapper, orderId).stream().findFirst();
    }

    @Override
    public List<Payment> findAll() {
        return jdbc.query("SELECT * FROM pay_payment ORDER BY id DESC", mapper);
    }

    private java.time.LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private Timestamp toTimestamp(java.time.LocalDateTime time) {
        return time == null ? null : Timestamp.valueOf(time);
    }
}
