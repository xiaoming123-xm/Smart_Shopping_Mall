package com.smartmall.ai.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@RequiredArgsConstructor
public class AiTaskProgressWebSocketHandler extends TextWebSocketHandler {
    private final AiContentGenerationService contentGeneration;
    private final ObjectMapper objectMapper;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String taskId = extractTaskId(session);
        executor.submit(() -> pushProgress(session, taskId));
    }

    private void pushProgress(WebSocketSession session, String taskId) {
        try {
            for (int i = 0; i < 12 && session.isOpen(); i++) {
                AiTaskDTO status = contentGeneration.status(taskId);
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(status)));
                if ("SUCCESS".equals(status.getStatus()) || "FAILED".equals(status.getStatus())) {
                    break;
                }
                Thread.sleep(700);
            }
        } catch (Exception ex) {
            try {
                if (session.isOpen()) {
                    session.close(CloseStatus.SERVER_ERROR);
                }
            } catch (Exception ignored) {
                // ignore close errors
            }
        }
    }

    private String extractTaskId(WebSocketSession session) {
        String path = session.getUri() == null ? "" : session.getUri().getPath();
        int idx = path.lastIndexOf('/');
        return idx >= 0 ? path.substring(idx + 1) : path;
    }
}
