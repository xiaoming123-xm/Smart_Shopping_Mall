package com.smartmall.ai.prompt;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AiPromptRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<AiPromptDTO> mapper = (rs, rowNum) -> {
        AiPromptDTO dto = new AiPromptDTO();
        dto.setId(rs.getLong("id"));
        dto.setCode(rs.getString("code"));
        dto.setCategory(rs.getString("category"));
        dto.setTitle(rs.getString("title"));
        dto.setContent(rs.getString("content"));
        dto.setEnabled(rs.getBoolean("enabled"));
        var updatedAt = rs.getTimestamp("updated_at");
        dto.setUpdatedAt(updatedAt == null ? null : updatedAt.toLocalDateTime());
        return dto;
    };

    @PostConstruct
    void initTable() {
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS ai_prompt_config (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    code VARCHAR(64) NOT NULL UNIQUE,
                    category VARCHAR(32) NOT NULL DEFAULT 'shopping_guide',
                    title VARCHAR(100) NOT NULL,
                    content LONGTEXT NOT NULL,
                    enabled BOOLEAN NOT NULL DEFAULT TRUE,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);
        try {
            jdbc.execute("ALTER TABLE ai_prompt_config ADD COLUMN category VARCHAR(32) NOT NULL DEFAULT 'shopping_guide'");
        } catch (Exception ignored) {
            // Column already exists in migrated databases.
        }
    }

    public List<AiPromptDTO> findAll() {
        return jdbc.query("SELECT * FROM ai_prompt_config ORDER BY category ASC, id ASC", mapper);
    }

    public List<AiPromptDTO> findEnabledByCategory(String category) {
        return jdbc.query(
                "SELECT * FROM ai_prompt_config WHERE category=? AND enabled=1 ORDER BY id ASC",
                mapper,
                category
        );
    }

    public Optional<AiPromptDTO> findByCode(String code) {
        try {
            return Optional.ofNullable(jdbc.queryForObject(
                    "SELECT * FROM ai_prompt_config WHERE code=?",
                    mapper,
                    code
            ));
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    public AiPromptDTO save(String code, String category, String title, String content, boolean enabled) {
        Integer count = jdbc.queryForObject("SELECT COUNT(1) FROM ai_prompt_config WHERE code=?", Integer.class, code);
        if (count != null && count > 0) {
            jdbc.update(
                    """
                    UPDATE ai_prompt_config
                    SET category=?, title=?, content=?, enabled=?, updated_at=CURRENT_TIMESTAMP
                    WHERE code=?
                    """,
                    category,
                    title,
                    content,
                    enabled,
                    code
            );
        } else {
            jdbc.update(
                    "INSERT INTO ai_prompt_config(code, category, title, content, enabled) VALUES (?, ?, ?, ?, ?)",
                    code,
                    category,
                    title,
                    content,
                    enabled
            );
        }
        return findByCode(code).orElseThrow();
    }

    public void deleteByCode(String code) {
        jdbc.update("DELETE FROM ai_prompt_config WHERE code=?", code);
    }
}
