package com.smartmall.ai.prompt;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AiPromptDTO {
    private Long id;
    private String code;
    private String category;
    private String title;
    private String content;
    private Boolean enabled;
    private LocalDateTime updatedAt;
}
