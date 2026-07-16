package com.smartmall.order.infrastructure.persistence;

import com.smartmall.order.domain.model.UserMessage;
import com.smartmall.order.domain.repository.UserMessageRepository;
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
public class JdbcUserMessageRepository implements UserMessageRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<UserMessage> mapper = (rs, rowNum) -> {
        UserMessage message = new UserMessage();
        message.setId(rs.getLong("id"));
        message.setMemberId(rs.getLong("member_id"));
        message.setOrderId((Long) rs.getObject("order_id"));
        message.setBusinessKey(rs.getString("business_key"));
        message.setType(rs.getString("type"));
        message.setTitle(rs.getString("title"));
        message.setContent(rs.getString("content"));
        message.setActionText(rs.getString("action_text"));
        message.setActionUrl(rs.getString("action_url"));
        message.setReadFlag(rs.getInt("read_flag") == 1);
        message.setVisible(rs.getInt("visible") == 1);
        message.setCreatedAt(toLocalDateTime(rs.getTimestamp("created_at")));
        message.setUpdatedAt(toLocalDateTime(rs.getTimestamp("updated_at")));
        return message;
    };

    public JdbcUserMessageRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public UserMessage saveOrUpdateByBusinessKey(UserMessage message) {
        Optional<UserMessage> existing = findByBusinessKey(message.getBusinessKey());
        if (existing.isPresent()) {
            Long id = existing.get().getId();
            jdbc.update("""
                    UPDATE user_message
                    SET member_id=?, order_id=?, type=?, title=?, content=?, action_text=?, action_url=?, read_flag=0, visible=1
                    WHERE id=?
                    """,
                    message.getMemberId(),
                    message.getOrderId(),
                    message.getType(),
                    message.getTitle(),
                    message.getContent(),
                    message.getActionText(),
                    message.getActionUrl(),
                    id
            );
            return findById(id).orElse(message);
        }

        KeyHolder holder = new GeneratedKeyHolder();
        jdbc.update(conn -> {
            PreparedStatement ps = conn.prepareStatement("""
                    INSERT INTO user_message(member_id, order_id, business_key, type, title, content, action_text, action_url, read_flag, visible)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, message.getMemberId());
            ps.setObject(2, message.getOrderId());
            ps.setString(3, message.getBusinessKey());
            ps.setString(4, message.getType());
            ps.setString(5, message.getTitle());
            ps.setString(6, message.getContent());
            ps.setString(7, message.getActionText());
            ps.setString(8, message.getActionUrl());
            ps.setInt(9, Boolean.TRUE.equals(message.getReadFlag()) ? 1 : 0);
            ps.setInt(10, Boolean.FALSE.equals(message.getVisible()) ? 0 : 1);
            return ps;
        }, holder);
        message.setId(holder.getKey().longValue());
        return findById(message.getId()).orElse(message);
    }

    @Override
    public List<UserMessage> findVisibleByMemberId(Long memberId) {
        return jdbc.query("""
                SELECT * FROM user_message
                WHERE member_id=? AND visible=1
                ORDER BY updated_at DESC, id DESC
                """, mapper, memberId);
    }

    @Override
    public Optional<UserMessage> findById(Long id) {
        return jdbc.query("SELECT * FROM user_message WHERE id=?", mapper, id).stream().findFirst();
    }

    @Override
    public void markRead(Long id) {
        jdbc.update("UPDATE user_message SET read_flag=1 WHERE id=?", id);
    }

    @Override
    public void hide(Long id) {
        jdbc.update("UPDATE user_message SET visible=0 WHERE id=?", id);
    }

    private Optional<UserMessage> findByBusinessKey(String businessKey) {
        return jdbc.query("SELECT * FROM user_message WHERE business_key=?", mapper, businessKey).stream().findFirst();
    }

    private java.time.LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
