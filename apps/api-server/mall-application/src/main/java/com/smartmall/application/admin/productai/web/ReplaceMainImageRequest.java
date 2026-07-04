package com.smartmall.application.admin.productai.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReplaceMainImageRequest {
    @NotNull
    private Long productId;
    @NotBlank
    private String imageUrl;
}
