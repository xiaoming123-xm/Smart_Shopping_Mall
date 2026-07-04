package com.smartmall.ai.knowledge;
import lombok.AllArgsConstructor;
import lombok.Data;
/** 知识片段(商品知识库 / FAQ / 规则库)。 */
@Data @AllArgsConstructor public class KnowledgeDocument {
    private String id;
    private String source;   // product / faq / policy
    private String content;
    private double score;
}
