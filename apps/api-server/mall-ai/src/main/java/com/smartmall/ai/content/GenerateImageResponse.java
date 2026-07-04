package com.smartmall.ai.content;

import lombok.Data;

@Data
public class GenerateImageResponse {
    private String taskId;
    private Long productId;
    private String imageUrl;
    private String provider;
    private String status;
}
