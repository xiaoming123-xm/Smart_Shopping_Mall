package com.smartmall.ai.content;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class AiWebSocketConfig implements WebSocketConfigurer {
    private final AiTaskProgressWebSocketHandler taskProgressHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(taskProgressHandler, "/ws/ai/task-progress/{taskId}")
                .setAllowedOriginPatterns("*");
    }
}
