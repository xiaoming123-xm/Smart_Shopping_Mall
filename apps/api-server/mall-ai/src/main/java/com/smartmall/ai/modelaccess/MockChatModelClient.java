package com.smartmall.ai.modelaccess;
import org.springframework.stereotype.Component;
import java.util.List;
/**
 * 离线/默认实现, 不依赖外部大模型。真实 DeepSeek/Qwen 接入后续替换或追加。
 * 通过 mall.ai.provider 选择 provider, 这里作为兜底始终可用。
 */
@Component public class MockChatModelClient implements ChatModelClient {
    private final AiProperties props;
    public MockChatModelClient(AiProperties props){ this.props=props; }
    @Override public String provider(){ return props.getProvider(); }
    @Override public String chat(List<ChatMessage> messages){
        String last = messages.isEmpty()? "" : messages.get(messages.size()-1).getContent();
        return "[" + props.getProvider() + "-mock] 收到: " + last;
    }
}
