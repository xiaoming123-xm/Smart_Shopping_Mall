package com.smartmall.ai.modelaccess;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;

@Primary
@Component
public class RoutingChatModelClient implements ChatModelClient {
    private final AiProperties props;
    private final MockChatModelClient mock;
    private final StepFunChatModelClient stepFun;

    public RoutingChatModelClient(AiProperties props, MockChatModelClient mock, StepFunChatModelClient stepFun) {
        this.props = props;
        this.mock = mock;
        this.stepFun = stepFun;
    }

    @Override
    public String provider() {
        return delegate().provider();
    }

    @Override
    public String chat(List<ChatMessage> messages) {
        return delegate().chat(messages);
    }

    private ChatModelClient delegate() {
        String provider = props.chatProvider().toLowerCase();
        if ("stepfun".equals(provider) || "step".equals(provider)) {
            return stepFun;
        }
        return mock;
    }
}
