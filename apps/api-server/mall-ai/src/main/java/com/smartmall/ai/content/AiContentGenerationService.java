package com.smartmall.ai.content;

import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class AiContentGenerationService {
    private final Map<String, AiTaskDTO> tasks = new ConcurrentHashMap<>();
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public GenerateImageResponse generateImage(GenerateImageRequest request) {
        String taskId = newTaskId("img");
        AiTaskDTO task = new AiTaskDTO();
        task.setTaskId(taskId);
        task.setProductId(request.getProductId());
        task.setTaskType("IMAGE");
        task.setStatus("SUCCESS");
        task.setProgress(100);
        task.setProvider("mock-image-provider");
        task.setOutputUrl(buildImageUrl(request));
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        tasks.put(taskId, task);

        GenerateImageResponse resp = new GenerateImageResponse();
        resp.setTaskId(taskId);
        resp.setProductId(request.getProductId());
        resp.setImageUrl(task.getOutputUrl());
        resp.setProvider(task.getProvider());
        resp.setStatus(task.getStatus());
        return resp;
    }

    public GenerateVideoResponse generateVideo(GenerateVideoRequest request) {
        String taskId = newTaskId("vid");
        AiTaskDTO task = new AiTaskDTO();
        task.setTaskId(taskId);
        task.setProductId(request.getProductId());
        task.setTaskType("VIDEO");
        task.setStatus("RUNNING");
        task.setProgress(0);
        task.setProvider("mock-ffmpeg-remotion");
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        tasks.put(taskId, task);
        executor.submit(() -> runVideoTask(taskId, request));

        GenerateVideoResponse resp = new GenerateVideoResponse();
        resp.setTaskId(taskId);
        resp.setStatus(task.getStatus());
        resp.setProgress(task.getProgress());
        return resp;
    }

    public AiTaskDTO status(String taskId) {
        AiTaskDTO task = tasks.get(taskId);
        if (task == null) {
            throw new BizException(ResultCode.AI_CONTENT_TASK_NOT_FOUND);
        }
        return copy(task);
    }

    private void runVideoTask(String taskId, GenerateVideoRequest request) {
        AiTaskDTO task = tasks.get(taskId);
        if (task == null) {
            return;
        }
        try {
            int[] steps = {18, 36, 58, 76, 92, 100};
            for (int step : steps) {
                Thread.sleep(650);
                task.setProgress(step);
                task.setUpdatedAt(LocalDateTime.now());
            }
            String text = request.getTemplate() == null ? "smart-mall-video" : request.getTemplate();
            task.setOutputUrl("https://example.com/smart-mall/videos/" + taskId + "-" + slug(text) + ".mp4");
            task.setStatus("SUCCESS");
            task.setUpdatedAt(LocalDateTime.now());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            task.setStatus("FAILED");
            task.setFailReason("video task interrupted");
            task.setUpdatedAt(LocalDateTime.now());
        }
    }

    private String buildImageUrl(GenerateImageRequest request) {
        String label = switch (request.getMode()) {
            case "change_background" -> "换背景";
            case "style_transfer" -> "风格图";
            case "smart_optimize" -> "高清优化";
            default -> "AI商品图";
        };
        String prompt = request.getPrompt() == null || request.getPrompt().isBlank() ? label : request.getPrompt();
        return "https://placehold.co/720x720?text=" + slug(label + " " + prompt);
    }

    private String newTaskId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private String slug(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private AiTaskDTO copy(AiTaskDTO task) {
        AiTaskDTO x = new AiTaskDTO();
        x.setTaskId(task.getTaskId());
        x.setProductId(task.getProductId());
        x.setTaskType(task.getTaskType());
        x.setStatus(task.getStatus());
        x.setProgress(task.getProgress());
        x.setProvider(task.getProvider());
        x.setOutputUrl(task.getOutputUrl());
        x.setFailReason(task.getFailReason());
        x.setCreatedAt(task.getCreatedAt());
        x.setUpdatedAt(task.getUpdatedAt());
        return x;
    }
}
