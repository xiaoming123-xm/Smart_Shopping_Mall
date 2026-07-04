package com.smartmall.ai.modelaccess;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
/** AI 配置, 见 application.yml: mall.ai.provider=deepseek */
@Component @ConfigurationProperties(prefix="mall.ai") @Data public class AiProperties {
    private String provider="deepseek";   // deepseek / qwen / openai / mock
    private String apiKey="";
    private String baseUrl="";
    private String model="";
}
