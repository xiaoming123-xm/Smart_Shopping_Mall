package com.smartmall.ai.knowledge;
import java.util.List;
/**
 * 第2层 知识与上下文层: 向量检索 + 重排序的统一抽象。
 * 让 AI 基于商城事实回答, 而非瞎编。
 */
public interface KnowledgeRetriever {
    List<KnowledgeDocument> retrieve(String query, int topK);
}
