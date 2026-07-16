package com.smartmall.ai.content;

public interface ImageGenerationClient {
    String provider();
    ImageGenerationResult generate(GenerateImageRequest request);
}
