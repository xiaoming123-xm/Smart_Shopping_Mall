package com.smartmall.ai.knowledge;
import org.springframework.stereotype.Component;
import java.util.List;
/** 骨架实现: 关键字命中。后续替换为向量库 + 重排序。 */
@Component public class InMemoryKnowledgeRetriever implements KnowledgeRetriever {
    private static final List<KnowledgeDocument> CORPUS = List.of(
        new KnowledgeDocument("faq-1","faq","支持 7 天无理由退货, 商品需保持完好。", 0),
        new KnowledgeDocument("policy-1","policy","标准快递 48 小时内发货, 偏远地区顺延。", 0),
        new KnowledgeDocument("product-1","product","纯棉基础款T恤: 100% 棉, 透气舒适, 多色可选。", 0)
    );
    @Override public List<KnowledgeDocument> retrieve(String query, int topK){
        String q = query==null? "" : query;
        return CORPUS.stream()
            .filter(d -> q.isBlank() || d.getContent().contains(q) || tokensHit(d.getContent(), q))
            .limit(topK<=0?3:topK)
            .toList();
    }
    private boolean tokensHit(String content, String q){
        for(String t : q.split("\\s+")) if(t.length()>=2 && content.contains(t)) return true;
        return false;
    }
}
