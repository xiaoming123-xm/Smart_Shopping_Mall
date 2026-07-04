package com.smartmall.ai.modelaccess;
import java.util.List;
/**
 * 第1层 模型接入层: 统一对话模型抽象。
 * 后续换模型(OpenAI/DeepSeek/Qwen)不动上层业务。
 */
public interface ChatModelClient {
    String provider();
    String chat(List<ChatMessage> messages);
}
