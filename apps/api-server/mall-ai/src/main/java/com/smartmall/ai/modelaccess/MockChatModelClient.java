package com.smartmall.ai.modelaccess;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MockChatModelClient implements ChatModelClient {
    private final AiProperties props;

    public MockChatModelClient(AiProperties props) {
        this.props = props;
    }

    @Override
    public String provider() {
        return "mock".equalsIgnoreCase(props.chatProvider()) ? "mock" : props.chatProvider() + "-mock";
    }

    @Override
    public String chat(List<ChatMessage> messages) {
        String last = messages.isEmpty() ? "" : messages.get(messages.size() - 1).getContent();
        return "[" + provider() + "] received: " + last;
    }
}
