package com.smartmall.ai.content;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AiTaskDTO {
    private String taskId;
    private Long productId;
    private String taskType;
    private String status;
    private Integer progress;
    private String provider;
    private String outputUrl;
    private String failReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
