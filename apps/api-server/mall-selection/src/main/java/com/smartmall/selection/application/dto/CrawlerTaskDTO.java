package com.smartmall.selection.application.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CrawlerTaskDTO {
    private String taskId;
    private String platform;
    private Long categoryId;
    private String keyword;
    private String status;
    private String triggerType;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Integer totalCount;
    private Integer successCount;
    private String failReason;
    private Integer retryCount;
    private String createdBy;
    private LocalDateTime createdAt;
}
