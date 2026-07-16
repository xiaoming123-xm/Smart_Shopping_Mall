package com.smartmall.ai.scenario;

import com.smartmall.ai.knowledge.KnowledgeDocument;
import com.smartmall.ai.knowledge.KnowledgeRetriever;
import com.smartmall.ai.memory.AiMemoryService;
import com.smartmall.ai.modelaccess.AiProperties;
import com.smartmall.ai.modelaccess.ChatMessage;
import com.smartmall.ai.modelaccess.ChatModelClient;
import com.smartmall.ai.prompt.AiPromptService;
import com.smartmall.catalog.application.SpuAppService;
import com.smartmall.catalog.application.dto.SpuDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ShoppingGuideService {
    private static final List<String> PRODUCT_TERMS = List.of(
            "水浒传", "世说新语", "运动鞋", "跑步鞋", "板鞋", "羽绒服", "照相机", "相机",
            "眉笔", "粉底", "苹果", "李子", "衬衫", "衬衣", "项链"
    );
    private static final Set<String> SHOPPING_WORDS = Set.of("买", "推荐", "想买", "想要", "有没有", "看看");

    private final ChatModelClient chat;
    private final KnowledgeRetriever retriever;
    private final AiProperties props;
    private final AiMemoryService memoryService;
    private final AiPromptService promptService;
    private final SpuAppService spuAppService;

    public ScenarioReply ask(Long memberId, String message) {
        if (asksAboutModel(message)) {
            String provider = chat.provider();
            String model = props.chatModel().isBlank() ? "未配置模型名" : props.chatModel();
            String reply = "当前接入的模型是 " + model + "，provider 是 " + provider + "。";
            memoryService.saveConversation(memberId, message, reply);
            return new ScenarioReply("shopping-guide", reply);
        }

        List<SpuDTO> products = spuAppService.list();
        ProductQuery query = ProductQuery.from(message);
        if (query.hasExplicitTerm()) {
            List<ProductMatch> matchedProducts = matchProducts(products, query).stream()
                    .limit(3)
                    .toList();
            String reply = matchedProducts.isEmpty()
                    ? buildNoMatchReply(query)
                    : buildMatchedProductReply(matchedProducts);
            memoryService.saveConversation(memberId, message, reply);
            return new ScenarioReply("shopping-guide", reply);
        }

        List<KnowledgeDocument> docs = retriever.retrieve(message, 3);
        StringBuilder ctx = new StringBuilder();
        ctx.append("【现有商品】\n");
        if (products.isEmpty()) {
            ctx.append("- 当前商城没有已上架商品。\n");
        } else {
            for (SpuDTO p : products) {
                appendProductLine(ctx, p);
            }
        }
        ctx.append("\n【补充资料】\n");
        for (KnowledgeDocument d : docs) {
            ctx.append("- ").append(d.getContent()).append("\n");
        }

        String profileContext = memoryService.buildPreferenceContext(memberId);
        String systemPrompt = promptService.activeShoppingGuidePrompt()
                + "\n必须只根据【现有商品】回答；如果没有匹配商品，必须明确说当前商城没有，不要推荐无关商品。\n"
                + ctx;
        if (!profileContext.isBlank()) {
            systemPrompt += "\n" + profileContext;
        }

        String reply = chat.chat(List.of(
                ChatMessage.system(systemPrompt),
                ChatMessage.user(message)
        ));
        memoryService.saveConversation(memberId, message, reply);
        return new ScenarioReply("shopping-guide", reply);
    }

    private List<ProductMatch> matchProducts(List<SpuDTO> products, ProductQuery query) {
        return products.stream()
                .map(product -> new ProductMatch(product, scoreProduct(product, query)))
                .filter(match -> match.score() >= 45)
                .sorted(Comparator.comparingInt(ProductMatch::score).reversed()
                        .thenComparing(match -> safePrice(match.product())))
                .toList();
    }

    private int scoreProduct(SpuDTO product, ProductQuery query) {
        String name = lower(product.getName());
        String description = lower(product.getDescription());
        String category = categoryText(product.getCategoryId());
        String text = name + " " + description + " " + lower(product.getAttributesJson()) + " " + category;
        int score = categoryScore(text, query.category());

        for (String term : query.terms()) {
            String lowerTerm = lower(term);
            if (name.equals(lowerTerm)) {
                score += 120;
            } else if (name.contains(lowerTerm)) {
                score += 80;
            } else if (text.contains(lowerTerm)) {
                score += 35;
            } else {
                score -= 80;
            }

            if ("苹果".equals(term) && !name.equals("苹果") && !isFreshCategory(product)) {
                score -= 40;
            }
        }
        return score;
    }

    private int categoryScore(String text, ProductCategory category) {
        return switch (category) {
            case SHOE -> text.matches(".*(鞋|运动鞋|跑步鞋|板鞋).*") ? 45 : -40;
            case DOWN_JACKET -> text.matches(".*(羽绒服|羽绒).*") && !text.matches(".*(衬衫|衬衣|t恤|短袖).*") ? 45 : -40;
            case SHIRT -> text.matches(".*(衬衫|衬衣).*") && !text.matches(".*(羽绒服|羽绒).*") ? 45 : -40;
            case CLOTHING -> text.matches(".*(服装|服饰|羽绒服|羽绒|衬衫|衬衣|毛衣|外套|上衣|女装|男装|鞋).*") ? 30 : -20;
            case FRESH -> text.matches(".*(食品生鲜|食品|生鲜|水果|李子|零食|饮料).*") ? 45 : -45;
            case BEAUTY -> text.matches(".*(美妆|个护|眉笔|粉底|口红|彩妆|护肤).*") ? 45 : -45;
            case DIGITAL -> text.matches(".*(数码|家电|照相机|相机|手机|电脑|耳机).*") ? 45 : -45;
            case BOOK -> text.matches(".*(文体娱乐|图书|书|小说|水浒传|世说新语).*") ? 45 : -45;
            case GIFT -> text.matches(".*(项链|礼物|饰品).*") ? 45 : -30;
            case GENERAL -> 0;
        };
    }

    private boolean isFreshCategory(SpuDTO product) {
        String category = categoryText(product.getCategoryId());
        return category.contains("食品") || category.contains("生鲜") || category.contains("水果");
    }

    private String categoryText(Long categoryId) {
        if (categoryId == null) return "";
        return switch (categoryId.intValue()) {
            case 1 -> "数码家电";
            case 2 -> "服装鞋帽";
            case 3 -> "美妆个护";
            case 4 -> "家居生活";
            case 5 -> "食品生鲜 水果";
            case 6 -> "文体娱乐 图书";
            case 7 -> "其他";
            case 8 -> "服装鞋帽 羽绒服";
            case 9 -> "服装鞋帽";
            case 301 -> "服装鞋帽 衬衫";
            case 302 -> "服装鞋帽 羽绒服";
            default -> "";
        };
    }

    private void appendProductLine(StringBuilder ctx, SpuDTO p) {
        ctx.append("- ID:").append(p.getId())
                .append(" 名称:").append(p.getName())
                .append(" 价格:").append(p.getPrice())
                .append(" 库存:").append(p.getStock())
                .append(" 分类ID:").append(p.getCategoryId())
                .append(" 分类:").append(categoryText(p.getCategoryId()))
                .append(" 描述:").append(p.getDescription() == null ? "" : p.getDescription())
                .append("\n");
    }

    private String buildMatchedProductReply(List<ProductMatch> matches) {
        StringBuilder reply = new StringBuilder("我只按当前商城已上架商品筛选，找到这些更相关的商品：\n");
        for (ProductMatch match : matches) {
            SpuDTO p = match.product();
            reply.append("- ").append(p.getName())
                    .append("，价格 ¥").append(p.getPrice() == null ? "待定" : p.getPrice())
                    .append("，库存 ").append(p.getStock() == null ? 0 : p.getStock())
                    .append("，分类 ").append(categoryText(p.getCategoryId()).isBlank() ? p.getCategoryId() : categoryText(p.getCategoryId()))
                    .append("\n");
        }
        reply.append("没有匹配到的商品我不会硬推荐。");
        return reply.toString();
    }

    private String buildNoMatchReply(ProductQuery query) {
        String target = query.terms().isEmpty() ? "这个商品" : String.join("、", query.terms());
        return "当前商城没有找到“" + target + "”对应的已上架商品，所以我不能随便推荐不相关商品。你可以换个关键词，或先到后台商品管理添加这个商品。";
    }

    private BigDecimal safePrice(SpuDTO product) {
        return product.getPrice() == null ? BigDecimal.ZERO : product.getPrice();
    }

    private boolean asksAboutModel(String message) {
        String text = message == null ? "" : message.toLowerCase(Locale.ROOT);
        return text.contains("模型")
                || text.contains("model")
                || text.contains("provider")
                || text.contains("接入的是什么");
    }

    private static String lower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

    private record ProductQuery(List<String> terms, ProductCategory category) {
        private static ProductQuery from(String message) {
            String text = message == null ? "" : message.trim();
            List<String> terms = new ArrayList<>();
            for (String term : PRODUCT_TERMS) {
                if (text.contains(term)) {
                    terms.add(term);
                }
            }

            String cleaned = text
                    .replaceAll("我想买|我要买|想买|我要|想要|有没有|有无|推荐|看看|商品|一个|一双|一支|一下|请|帮我|给我", "")
                    .replaceAll("\\d+(?:\\.\\d+)?\\s*(元|块|以内|以下)", "")
                    .replaceAll("[，。！？、,.!?\\s]", "")
                    .trim();
            if (cleaned.length() >= 2 && terms.stream().noneMatch(term -> term.contains(cleaned) || cleaned.contains(term)) && SHOPPING_WORDS.stream().noneMatch(cleaned::contains)) {
                terms.add(cleaned);
            }

            return new ProductQuery(terms.stream().distinct().toList(), ProductCategory.from(text));
        }

        private boolean hasExplicitTerm() {
            return !terms.isEmpty();
        }
    }

    private record ProductMatch(SpuDTO product, int score) {
    }

    private enum ProductCategory {
        SHOE,
        DOWN_JACKET,
        SHIRT,
        CLOTHING,
        FRESH,
        BEAUTY,
        DIGITAL,
        BOOK,
        GIFT,
        GENERAL;

        private static ProductCategory from(String text) {
            if (text == null) return GENERAL;
            if (text.matches(".*(鞋靴|运动鞋|跑步鞋|板鞋).*")) return SHOE;
            if (text.matches(".*(羽绒服|羽绒).*")) return DOWN_JACKET;
            if (text.matches(".*(衬衫|衬衣).*")) return SHIRT;
            if (text.matches(".*(毛衣|衣服|外套|上衣|服装|女装|男装).*")) return CLOTHING;
            if (text.matches(".*(苹果|李子|水果|生鲜|食品|零食|饮料).*")) return FRESH;
            if (text.matches(".*(眉笔|粉底|口红|美妆|彩妆|护肤).*")) return BEAUTY;
            if (text.matches(".*(照相机|相机|手机|数码|家电|电脑|耳机).*")) return DIGITAL;
            if (text.matches(".*(水浒传|世说新语|书|图书|小说).*")) return BOOK;
            if (text.matches(".*(项链|礼物|饰品).*")) return GIFT;
            return GENERAL;
        }
    }
}
