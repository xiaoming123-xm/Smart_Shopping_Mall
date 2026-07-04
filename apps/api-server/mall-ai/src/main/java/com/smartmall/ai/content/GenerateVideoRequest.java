package com.smartmall.ai.content;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class GenerateVideoRequest {
    @NotNull
    private Long productId;
    @NotEmpty
    private List<String> imageUrls;
    private String copyText;
    private String template;
    private String voiceStyle;
}
