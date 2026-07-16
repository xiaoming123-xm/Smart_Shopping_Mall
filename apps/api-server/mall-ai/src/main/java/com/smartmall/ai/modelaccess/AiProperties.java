package com.smartmall.ai.modelaccess;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
/** AI 配置, 见 application.yml: mall.ai.provider=deepseek */
@Component @ConfigurationProperties(prefix="mall.ai") @Data public class AiProperties {
    private String provider="mock";
    private String apiKey="";
    private String baseUrl="";
    private String model="";
    private Integer timeoutMs=30000;
    private Chat chat = new Chat();
    private Image image = new Image();
    private Video video = new Video();

    public String chatProvider() { return first(chat.getProvider(), provider, "mock"); }
    public String chatApiKey() { return first(chat.getApiKey(), apiKey, ""); }
    public String chatBaseUrl() { return first(chat.getBaseUrl(), baseUrl, ""); }
    public String chatModel() { return first(chat.getModel(), model, ""); }
    public int chatTimeoutMs() { return first(chat.getTimeoutMs(), timeoutMs, 30000); }

    public String imageProvider() { return first(image.getProvider(), chatProvider(), "mock"); }
    public String imageApiKey() { return first(image.getApiKey(), chatApiKey(), ""); }
    public String imageBaseUrl() { return first(image.getBaseUrl(), chatBaseUrl(), ""); }
    public String imageModel() { return first(image.getModel(), ""); }
    public String imageSize() { return first(image.getSize(), "1024x1024"); }
    public String imageResponseFormat() { return first(image.getResponseFormat(), "url"); }
    public int imageTimeoutMs() { return first(image.getTimeoutMs(), 60000); }

    public String videoProvider() { return first(video.getProvider(), "mock"); }
    public String videoApiKey() { return first(video.getApiKey(), ""); }
    public String videoBaseUrl() { return first(video.getBaseUrl(), ""); }
    public String videoModel() { return first(video.getModel(), ""); }
    public String videoAppId() { return first(video.getAppId(), ""); }
    public String videoWorkflowId() { return first(video.getWorkflowId(), ""); }
    public int videoTimeoutMs() { return first(video.getTimeoutMs(), 120000); }

    private static String first(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private static int first(Integer... values) {
        for (Integer value : values) {
            if (value != null && value > 0) {
                return value;
            }
        }
        return 0;
    }

    @Data public static class Chat {
        private String provider="";
        private String apiKey="";
        private String baseUrl="";
        private String model="";
        private Integer timeoutMs=30000;
    }

    @Data public static class Image {
        private String provider="";
        private String apiKey="";
        private String baseUrl="";
        private String model="";
        private String size="1024x1024";
        private String responseFormat="url";
        private Integer timeoutMs=60000;
    }

    @Data public static class Video {
        private String provider="mock";
        private String apiKey="";
        private String baseUrl="";
        private String model="";
        private String appId="";
        private String workflowId="";
        private Integer timeoutMs=120000;
    }
}
