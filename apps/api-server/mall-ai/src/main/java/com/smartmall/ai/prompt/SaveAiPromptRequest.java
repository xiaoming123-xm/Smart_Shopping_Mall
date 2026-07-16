package com.smartmall.ai.prompt;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SaveAiPromptRequest {
    @NotBlank
    private String category;
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private Boolean enabled;
}
