package com.smartmall.ai.content;

import com.smartmall.ai.modelaccess.AiProperties;
import com.smartmall.ai.prompt.AiPromptService;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class AiContentGenerationService {
    private final ExecutorService executor = Executors.newCachedThreadPool();
    private final RoutingImageGenerationClient imageClient;
    private final AiProperties props;
    private final JdbcAiContentRepository repository;
    private final ObjectMapper objectMapper;
    private final AiPromptService promptService;

    public AiContentGenerationService(
            RoutingImageGenerationClient imageClient,
            AiProperties props,
            JdbcAiContentRepository repository,
            ObjectMapper objectMapper,
            AiPromptService promptService
    ) {
        this.imageClient = imageClient;
        this.props = props;
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.promptService = promptService;
    }

    public GenerateImageResponse generateImage(GenerateImageRequest request) {
        String taskId = newTaskId("img");
        request.setPrompt(mergePrompt(promptService.activeImageGenerationPrompt(), request.getPrompt()));
        ImageGenerationResult result = imageClient.generate(request);
        repository.createTask(
                taskId,
                request.getProductId(),
                "IMAGE",
                result.status(),
                100,
                result.provider(),
                buildImageRequestPayload(request)
        );
        repository.saveAsset(
                taskId,
                request.getProductId(),
                "IMAGE",
                toJson(sanitizeSourceUrls(List.of(request.getImageUrl()))),
                result.imageUrl(),
                request.getPrompt(),
                request.getMode(),
                null
        );

        GenerateImageResponse resp = new GenerateImageResponse();
        resp.setTaskId(taskId);
        resp.setProductId(request.getProductId());
        resp.setImageUrl(result.imageUrl());
        resp.setProvider(result.provider());
        resp.setStatus(result.status());
        return resp;
    }

    public GenerateVideoResponse generateVideo(GenerateVideoRequest request) {
        String taskId = newTaskId("vid");
        String provider = videoProviderName();
        repository.createTask(taskId, request.getProductId(), "VIDEO", "RUNNING", 0, provider, toJson(request));
        executor.submit(() -> runVideoTask(taskId, request));

        GenerateVideoResponse resp = new GenerateVideoResponse();
        resp.setTaskId(taskId);
        resp.setStatus("RUNNING");
        resp.setProgress(0);
        return resp;
    }

    public AiTaskDTO status(String taskId) {
        return repository.findTask(taskId)
                .orElseThrow(() -> new BizException(ResultCode.AI_CONTENT_TASK_NOT_FOUND));
    }

    private void runVideoTask(String taskId, GenerateVideoRequest request) {
        try {
            int[] steps = {18, 36, 58, 76, 92, 100};
            for (int step : steps) {
                Thread.sleep(650);
                repository.updateTask(taskId, "RUNNING", step, null);
            }
            String text = request.getTemplate() == null ? "smart-mall-video" : request.getTemplate();
            String outputUrl = "https://example.com/smart-mall/videos/" + taskId + "-" + text + ".mp4";
            repository.updateTask(taskId, "SUCCESS", 100, null);
            repository.saveAsset(
                    taskId,
                    request.getProductId(),
                    "VIDEO",
                    toJson(request.getImageUrls()),
                    outputUrl,
                    request.getCopyText(),
                    request.getVoiceStyle(),
                    request.getTemplate()
            );
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            repository.updateTask(taskId, "FAILED", 0, "video task interrupted");
        } catch (Exception ex) {
            repository.updateTask(taskId, "FAILED", 0, ex.getMessage());
        }
    }

    private String videoProviderName() {
        String provider = props.videoProvider().toLowerCase();
        if ("dify".equals(provider)) {
            if (!props.videoWorkflowId().isBlank()) {
                return "dify/" + props.videoWorkflowId();
            }
            if (!props.videoAppId().isBlank()) {
                return "dify/" + props.videoAppId();
            }
            return "dify-pending-config";
        }
        if (!props.videoModel().isBlank()) {
            return provider + "/" + props.videoModel();
        }
        return "mock-ffmpeg-remotion";
    }

    private String newTaskId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new BizException(ResultCode.AI_BAD_REQUEST, "AI request payload serialization failed");
        }
    }

    private String buildImageRequestPayload(GenerateImageRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("productId", request.getProductId());
        payload.put("mode", request.getMode());
        payload.put("prompt", request.getPrompt());
        payload.put("imageUrl", summarizeUrl(request.getImageUrl()));
        return toJson(payload);
    }

    private List<String> sanitizeSourceUrls(List<String> urls) {
        return urls == null ? List.of() : urls.stream().map(this::summarizeUrl).toList();
    }

    private String mergePrompt(String basePrompt, String userPrompt) {
        String base = basePrompt == null ? "" : basePrompt.trim();
        String user = userPrompt == null ? "" : userPrompt.trim();
        if (base.isBlank()) {
            return user;
        }
        if (user.isBlank()) {
            return base;
        }
        return base + "\n\n用户补充要求：" + user;
    }

    private String summarizeUrl(String url) {
        if (url == null || url.isBlank()) {
            return url;
        }
        if (url.startsWith("data:")) {
            int comma = url.indexOf(',');
            String meta = comma > 0 ? url.substring(0, comma) : "data:";
            int payloadLength = comma > 0 ? url.length() - comma - 1 : url.length();
            return meta + ",[omitted base64 length=" + payloadLength + "]";
        }
        if (url.length() > 512) {
            return url.substring(0, 512) + "...[truncated length=" + url.length() + "]";
        }
        return url;
    }
}
