package com.smartmall.ai.content;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcAiContentRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<AiTaskDTO> taskMapper = (rs, rowNum) -> {
        AiTaskDTO dto = new AiTaskDTO();
        dto.setTaskId(rs.getString("task_id"));
        dto.setProductId(rs.getLong("product_id"));
        dto.setTaskType(rs.getString("task_type"));
        dto.setStatus(rs.getString("status"));
        dto.setProgress(rs.getInt("progress"));
        dto.setProvider(rs.getString("provider"));
        dto.setFailReason(rs.getString("fail_reason"));
        dto.setOutputUrl(rs.getString("output_url"));
        dto.setCreatedAt(toLocalDateTime(rs.getTimestamp("created_at")));
        dto.setUpdatedAt(toLocalDateTime(rs.getTimestamp("updated_at")));
        return dto;
    };

    public JdbcAiContentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void createTask(String taskId, Long productId, String taskType, String status, int progress, String provider, String requestPayload) {
        jdbc.update(
                """
                INSERT INTO ai_generation_tasks(task_id, product_id, task_type, status, progress, provider, request_payload, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                taskId,
                productId,
                taskType,
                status,
                progress,
                provider,
                requestPayload,
                "system"
        );
    }

    public void updateTask(String taskId, String status, int progress, String failReason) {
        jdbc.update(
                """
                UPDATE ai_generation_tasks
                SET status=?, progress=?, fail_reason=?, updated_at=CURRENT_TIMESTAMP
                WHERE task_id=?
                """,
                status,
                progress,
                failReason,
                taskId
        );
    }

    public void saveAsset(String taskId, Long productId, String assetType, String sourceUrls, String outputUrl, String prompt, String mode, String template) {
        jdbc.update(
                """
                INSERT INTO ai_generated_assets(task_id, product_id, asset_type, source_urls, output_url, prompt, mode, template, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                taskId,
                productId,
                assetType,
                sourceUrls,
                outputUrl,
                prompt,
                mode,
                template,
                "system"
        );
    }

    public Optional<AiTaskDTO> findTask(String taskId) {
        return jdbc.query(
                """
                SELECT t.task_id,
                       t.product_id,
                       t.task_type,
                       t.status,
                       t.progress,
                       t.provider,
                       t.fail_reason,
                       t.created_at,
                       t.updated_at,
                       (
                           SELECT a.output_url
                           FROM ai_generated_assets a
                           WHERE a.task_id = t.task_id
                           ORDER BY a.id DESC
                           LIMIT 1
                       ) AS output_url
                FROM ai_generation_tasks t
                WHERE t.task_id=?
                """,
                taskMapper,
                taskId
        ).stream().findFirst();
    }

    public List<AiTaskDTO> findRecentTasks(int limit) {
        return jdbc.query(
                """
                SELECT t.task_id,
                       t.product_id,
                       t.task_type,
                       t.status,
                       t.progress,
                       t.provider,
                       t.fail_reason,
                       t.created_at,
                       t.updated_at,
                       (
                           SELECT a.output_url
                           FROM ai_generated_assets a
                           WHERE a.task_id = t.task_id
                           ORDER BY a.id DESC
                           LIMIT 1
                       ) AS output_url
                FROM ai_generation_tasks t
                ORDER BY t.id DESC
                LIMIT ?
                """,
                taskMapper,
                Math.max(1, limit)
        );
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
