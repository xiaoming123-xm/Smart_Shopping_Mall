package com.smartmall.ai.scenario;
import com.smartmall.ai.knowledge.KnowledgeDocument;
import com.smartmall.ai.knowledge.KnowledgeRetriever;
import com.smartmall.ai.modelaccess.ChatMessage;
import com.smartmall.ai.modelaccess.ChatModelClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
/** 第4层 业务场景层: 商品问答。 */
@Service @RequiredArgsConstructor public class ProductQaService {
    private final ChatModelClient chat;
    private final KnowledgeRetriever retriever;
    public ScenarioReply ask(String message){
        List<KnowledgeDocument> docs=retriever.retrieve(message, 3);
        StringBuilder ctx=new StringBuilder();
        for(KnowledgeDocument d: docs) ctx.append("- ").append(d.getContent()).append("\n");
        String reply=chat.chat(List.of(
            ChatMessage.system("你是商品问答助手, 仅依据资料回答:\n"+ctx),
            ChatMessage.user(message)
        ));
        return new ScenarioReply("product-qa", reply);
    }
}
