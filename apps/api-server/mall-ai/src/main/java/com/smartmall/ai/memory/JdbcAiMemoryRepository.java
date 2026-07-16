package com.smartmall.ai.memory;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class JdbcAiMemoryRepository implements AiMemoryRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<AiChatMessageDTO> messageMapper = (rs, rowNum) -> {
        AiChatMessageDTO dto = new AiChatMessageDTO();
        dto.setId(rs.getLong("id"));
        dto.setMemberId(rs.getLong("member_id"));
        dto.setRole(rs.getString("role"));
        dto.setMessage(rs.getString("message"));
        var createdAt = rs.getTimestamp("created_at");
        dto.setCreatedAt(createdAt == null ? null : createdAt.toLocalDateTime());
        return dto;
    };

    private final RowMapper<AiUserPreferenceDTO> preferenceMapper = (rs, rowNum) -> {
        AiUserPreferenceDTO dto = new AiUserPreferenceDTO();
        dto.setId(rs.getLong("id"));
        dto.setMemberId(rs.getLong("member_id"));
        dto.setPreferenceKey(rs.getString("preference_key"));
        dto.setPreferenceValue(rs.getString("preference_value"));
        dto.setSourceText(rs.getString("source_text"));
        var updatedAt = rs.getTimestamp("updated_at");
        dto.setUpdatedAt(updatedAt == null ? null : updatedAt.toLocalDateTime());
        return dto;
    };

    public JdbcAiMemoryRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void saveMessage(Long memberId, String role, String message) {
        jdbc.update(
                "INSERT INTO ai_chat_message(member_id, role, message) VALUES (?, ?, ?)",
                memberId,
                role,
                message
        );
    }

    @Override
    public List<AiChatMessageDTO> listRecentMessages(Long memberId, int limit) {
        return jdbc.query(
                "SELECT * FROM ai_chat_message WHERE member_id=? ORDER BY id DESC LIMIT ?",
                messageMapper,
                memberId,
                Math.max(1, limit)
        );
    }

    @Override
    public void upsertPreference(Long memberId, String key, String value, String sourceText) {
        Integer exists = jdbc.queryForObject(
                "SELECT COUNT(1) FROM ai_user_preference WHERE member_id=? AND preference_key=?",
                Integer.class,
                memberId,
                key
        );
        if (exists != null && exists > 0) {
            jdbc.update(
                    """
                    UPDATE ai_user_preference
                    SET preference_value=?, source_text=?, updated_at=CURRENT_TIMESTAMP
                    WHERE member_id=? AND preference_key=?
                    """,
                    value,
                    sourceText,
                    memberId,
                    key
            );
            return;
        }
        jdbc.update(
                "INSERT INTO ai_user_preference(member_id, preference_key, preference_value, source_text) VALUES (?, ?, ?, ?)",
                memberId,
                key,
                value,
                sourceText
        );
    }

    @Override
    public List<AiUserPreferenceDTO> listPreferences(Long memberId) {
        return jdbc.query(
                "SELECT * FROM ai_user_preference WHERE member_id=? ORDER BY updated_at DESC, id DESC",
                preferenceMapper,
                memberId
        );
    }
}
