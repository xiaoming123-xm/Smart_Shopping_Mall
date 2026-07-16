package com.smartmall.ai.scenario;
import com.smartmall.ai.prompt.AiPromptService;
import com.smartmall.ai.modelaccess.ChatMessage;
import com.smartmall.ai.modelaccess.ChatModelClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
/** 第4层 业务场景层: 运营文案生成 / 卖点提炼。 */
@Service @RequiredArgsConstructor public class CopywritingService {
    private final ChatModelClient chat;
    private final AiPromptService promptService;
    public ScenarioReply generate(String message){
        String reply=chat.chat(List.of(
            ChatMessage.system(promptService.activeCopywritingPrompt()),
            ChatMessage.user(message)
        ));
        return new ScenarioReply("copywriting", reply);
    }
}
