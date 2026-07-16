package com.smartmall.ai.content;

import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class MockImageGenerationClient implements ImageGenerationClient {
    @Override
    public String provider() {
        return "mock-image-provider";
    }

    @Override
    public ImageGenerationResult generate(GenerateImageRequest request) {
        String label = switch (request.getMode()) {
            case "change_background" -> "Change Background";
            case "style_transfer" -> "Style Transfer";
            case "smart_optimize" -> "Smart Optimize";
            default -> "AI Product Image";
        };
        String prompt = request.getPrompt() == null || request.getPrompt().isBlank() ? label : request.getPrompt();
        String imageUrl = "https://placehold.co/720x720?text=" + slug(label + " " + prompt);
        return new ImageGenerationResult(provider(), imageUrl, "SUCCESS");
    }

    private String slug(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
