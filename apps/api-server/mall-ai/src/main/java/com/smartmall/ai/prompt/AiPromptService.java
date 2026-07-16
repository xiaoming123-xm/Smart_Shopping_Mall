package com.smartmall.ai.prompt;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiPromptService {
    public static final String SHOPPING_GUIDE_CATEGORY = "shopping_guide";
    public static final String PRODUCT_QA_CATEGORY = "product_qa";
    public static final String IMAGE_GENERATION_CATEGORY = "image_generation";
    public static final String COPYWRITING_CATEGORY = "copywriting";

    public static final String SHOPPING_GUIDE_CODE = "shopping-guide-core";
    public static final String IMAGE_GENERATION_CODE = "image-generation-core";
    public static final String PRODUCT_QA_CODE = "product-qa-core";
    public static final String COPYWRITING_CODE = "copywriting-core";

    public static final String DEFAULT_SHOPPING_GUIDE_PROMPT = """
            你是商城智能导购，必须严格基于系统提供的【现有商品】回答。
            规则：
            1. 只能推荐、比较、介绍【现有商品】里出现的商品，不能编造不存在的商品、价格、库存、规格或图片。
            2. 如果现有商品里没有满足用户条件的商品，要直接说明“当前商城没有找到符合条件的商品”，并建议用户换条件或去后台添加商品。
            3. 回答商品时尽量包含商品名、价格、库存或可购买状态。
            4. 不确定的信息不要猜。内容可以更完整、更专业一些，让回答看起来有分析能力，但不要偏离商城智能导购的功能范围。
            """;
    public static final String DEFAULT_PRODUCT_QA_PROMPT = "你是商品问答助手，只能依据商品资料和商城政策回答，不要编造。";
    public static final String DEFAULT_IMAGE_GENERATION_PROMPT = "生成电商商品图时必须保持商品主体真实、可售卖，不要改变商品种类、品牌、颜色和关键结构。";
    public static final String DEFAULT_COPYWRITING_PROMPT = "你是电商运营文案助手，输出简洁、真实、有吸引力的卖点，不夸大不存在的功能。";

    private final AiPromptRepository repo;

    public List<AiPromptDTO> listPrompts() {
        ensureDefaults();
        return repo.findAll();
    }

    public AiPromptDTO getPrompt(String code) {
        ensureDefaults();
        return repo.findByCode(code).orElseThrow();
    }

    public AiPromptDTO savePrompt(String code, SaveAiPromptRequest req) {
        return repo.save(
                code,
                req.getCategory(),
                req.getTitle(),
                req.getContent(),
                req.getEnabled() == null || req.getEnabled()
        );
    }

    public void deletePrompt(String code) {
        repo.deleteByCode(code);
    }

    public String activeCategoryPrompt(String category, String fallback) {
        String joined = repo.findEnabledByCategory(category).stream()
                .map(AiPromptDTO::getContent)
                .filter(content -> content != null && !content.isBlank())
                .reduce((a, b) -> a + "\n\n" + b)
                .orElse("");
        return joined.isBlank() ? fallback : joined;
    }

    public String activeShoppingGuidePrompt() {
        ensureDefaults();
        return activeCategoryPrompt(SHOPPING_GUIDE_CATEGORY, DEFAULT_SHOPPING_GUIDE_PROMPT);
    }

    public String activeProductQaPrompt() {
        ensureDefaults();
        return activeCategoryPrompt(PRODUCT_QA_CATEGORY, DEFAULT_PRODUCT_QA_PROMPT);
    }

    public String activeImageGenerationPrompt() {
        ensureDefaults();
        return activeCategoryPrompt(IMAGE_GENERATION_CATEGORY, DEFAULT_IMAGE_GENERATION_PROMPT);
    }

    public String activeCopywritingPrompt() {
        ensureDefaults();
        return activeCategoryPrompt(COPYWRITING_CATEGORY, DEFAULT_COPYWRITING_PROMPT);
    }

    private void ensureDefaults() {
        if (repo.findByCode(SHOPPING_GUIDE_CODE).isEmpty()) {
            repo.save(SHOPPING_GUIDE_CODE, SHOPPING_GUIDE_CATEGORY, "AI智能购物-基础约束", DEFAULT_SHOPPING_GUIDE_PROMPT, true);
        }
        if (repo.findByCode(IMAGE_GENERATION_CODE).isEmpty()) {
            repo.save(IMAGE_GENERATION_CODE, IMAGE_GENERATION_CATEGORY, "商品图片生成-基础约束", DEFAULT_IMAGE_GENERATION_PROMPT, true);
        }
        if (repo.findByCode(PRODUCT_QA_CODE).isEmpty()) {
            repo.save(PRODUCT_QA_CODE, PRODUCT_QA_CATEGORY, "商品问答-基础约束", DEFAULT_PRODUCT_QA_PROMPT, true);
        }
        if (repo.findByCode(COPYWRITING_CODE).isEmpty()) {
            repo.save(COPYWRITING_CODE, COPYWRITING_CATEGORY, "运营文案-基础约束", DEFAULT_COPYWRITING_PROMPT, true);
        }
    }
}
