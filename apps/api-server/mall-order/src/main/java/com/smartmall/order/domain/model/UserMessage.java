package com.smartmall.order.domain.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserMessage {
    private Long id;
    private Long memberId;
    private Long orderId;
    private String businessKey;
    private String type;
    private String title;
    private String content;
    private String actionText;
    private String actionUrl;
    private Boolean readFlag;
    private Boolean visible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
