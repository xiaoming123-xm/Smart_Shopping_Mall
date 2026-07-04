package com.smartmall.ai.scenario;
import com.smartmall.ai.knowledge.KnowledgeDocument;
import com.smartmall.ai.knowledge.KnowledgeRetriever;
import com.smartmall.ai.modelaccess.ChatMessage;
import com.smartmall.ai.modelaccess.ChatModelClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
/** 第4层 业务场景层: 智能导购(RAG: 检索知识 + 模型生成)。 */
@Service @RequiredArgsConstructor public class ShoppingGuideService {
    private final ChatModelClient chat;
    private final KnowledgeRetriever retriever;
    public ScenarioReply ask(String message){
        List<KnowledgeDocument> docs=retriever.retrieve(message, 3);
        StringBuilder ctx=new StringBuilder();
        for(KnowledgeDocument d: docs) ctx.append("- ").append(d.getContent()).append("\n");
        String reply=chat.chat(List.of(
            ChatMessage.system("你是商城智能导购, 基于以下事实回答, 不要编造:\n"+ctx),
            ChatMessage.user(message)
        ));
        return new ScenarioReply("shopping-guide", reply);
    }
}
