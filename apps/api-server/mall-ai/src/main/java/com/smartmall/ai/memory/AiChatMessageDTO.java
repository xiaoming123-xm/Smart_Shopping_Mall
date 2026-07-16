package com.smartmall.ai.memory;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AiChatMessageDTO {
    private Long id;
    private Long memberId;
    private String role;
    private String message;
    private LocalDateTime createdAt;
}
