package com.smartmall.ai.content;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GenerateImageRequest {
    @NotNull
    private Long productId;
    @NotBlank
    private String imageUrl;
    @NotBlank
    private String mode;
    private String prompt;
}
