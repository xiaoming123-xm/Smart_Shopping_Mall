package com.smartmall.ai.scenario;
import com.smartmall.ai.knowledge.KnowledgeDocument;
import com.smartmall.ai.knowledge.KnowledgeRetriever;
import com.smartmall.ai.modelaccess.ChatMessage;
import com.smartmall.ai.modelaccess.ChatModelClient;
import com.smartmall.ai.prompt.AiPromptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
/** 第4层 业务场景层: 商品问答。 */
@Service @RequiredArgsConstructor public class ProductQaService {
    private final ChatModelClient chat;
    private final KnowledgeRetriever retriever;
    private final AiPromptService promptService;
    public ScenarioReply ask(String message){
        List<KnowledgeDocument> docs=retriever.retrieve(message, 3);
        StringBuilder ctx=new StringBuilder();
        for(KnowledgeDocument d: docs) ctx.append("- ").append(d.getContent()).append("\n");
        String reply=chat.chat(List.of(
            ChatMessage.system(promptService.activeProductQaPrompt()+"\n仅依据资料回答:\n"+ctx),
            ChatMessage.user(message)
        ));
        return new ScenarioReply("product-qa", reply);
    }
}
