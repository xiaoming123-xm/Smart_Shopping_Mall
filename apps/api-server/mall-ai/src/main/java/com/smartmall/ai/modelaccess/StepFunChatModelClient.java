package com.smartmall.ai.modelaccess;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class StepFunChatModelClient implements ChatModelClient {
    private final AiProperties props;
    private final ObjectMapper objectMapper;

    public StepFunChatModelClient(AiProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
    }

    @Override
    public String provider() {
        return "stepfun";
    }

    @Override
    public String chat(List<ChatMessage> messages) {
        String baseUrl = props.chatBaseUrl();
        String apiKey = props.chatApiKey();
        String model = props.chatModel();
        if (baseUrl.isBlank() || apiKey.isBlank() || model.isBlank()) {
            throw new BizException(ResultCode.AI_PROVIDER_UNAVAILABLE, "StepFun 聊天模型配置不完整");
        }
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);
            body.put("messages", toMessages(messages));
            JsonNode node = restClient(baseUrl, props.chatTimeoutMs())
                    .post()
                    .uri("/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            String content = node == null ? "" : node.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) {
                throw new BizException(ResultCode.AI_PROVIDER_UNAVAILABLE, "StepFun 聊天模型未返回有效内容");
            }
            return content;
        } catch (ResourceAccessException ex) {
            throw new BizException(ResultCode.AI_TIMEOUT, "StepFun 聊天调用超时");
        } catch (RestClientException ex) {
            throw new BizException(ResultCode.AI_PROVIDER_UNAVAILABLE, "StepFun 聊天调用失败: " + ex.getMessage());
        }
    }

    private List<Map<String, String>> toMessages(List<ChatMessage> messages) {
        List<Map<String, String>> items = new ArrayList<>();
        for (ChatMessage message : messages) {
            Map<String, String> item = new LinkedHashMap<>();
            item.put("role", message.getRole());
            item.put("content", message.getContent());
            items.add(item);
        }
        return items;
    }

    private RestClient restClient(String baseUrl, int timeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);
        return RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }
}
