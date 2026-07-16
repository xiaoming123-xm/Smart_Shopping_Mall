package com.smartmall.ai.memory;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AiUserPreferenceDTO {
    private Long id;
    private Long memberId;
    private String preferenceKey;
    private String preferenceValue;
    private String sourceText;
    private LocalDateTime updatedAt;
}
