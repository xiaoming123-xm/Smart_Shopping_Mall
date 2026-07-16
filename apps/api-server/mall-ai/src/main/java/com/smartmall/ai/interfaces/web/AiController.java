package com.smartmall.ai.interfaces.web;

import com.smartmall.ai.content.*;
import com.smartmall.ai.memory.AiChatMessageDTO;
import com.smartmall.ai.memory.AiMemoryService;
import com.smartmall.ai.prompt.AiPromptDTO;
import com.smartmall.ai.prompt.AiPromptService;
import com.smartmall.ai.prompt.SaveAiPromptRequest;
import com.smartmall.ai.scenario.*;
import com.smartmall.common.api.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final ShoppingGuideService shoppingGuide;
    private final ProductQaService productQa;
    private final CopywritingService copywriting;
    private final AiContentGenerationService contentGeneration;
    private final AiMemoryService memoryService;
    private final AiPromptService promptService;

    @PostMapping("/shopping-guide")
    public R<ScenarioReply> guide(@Valid @RequestBody ScenarioRequest req) {
        return R.ok(shoppingGuide.ask(req.getMemberId(), req.getMessage()));
    }

    @GetMapping("/shopping-guide/history")
    public R<List<AiChatMessageDTO>> history(@RequestParam(required = false) Long memberId, @RequestParam(defaultValue = "30") int limit) {
        return R.ok(memoryService.listRecentMessages(memberId, limit));
    }

    @GetMapping("/prompts")
    public R<List<AiPromptDTO>> listPrompts() {
        return R.ok(promptService.listPrompts());
    }

    @PostMapping("/prompts")
    public R<AiPromptDTO> createPrompt(@Valid @RequestBody SaveAiPromptRequest req) {
        String code = req.getCategory().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_\\-]", "-")
                + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return R.ok(promptService.savePrompt(code, req));
    }

    @GetMapping("/prompts/{code}")
    public R<AiPromptDTO> getPrompt(@PathVariable String code) {
        return R.ok(promptService.getPrompt(normalizePromptCode(code)));
    }

    @PutMapping("/prompts/{code}")
    public R<AiPromptDTO> savePrompt(@PathVariable String code, @Valid @RequestBody SaveAiPromptRequest req) {
        return R.ok(promptService.savePrompt(normalizePromptCode(code), req));
    }

    @DeleteMapping("/prompts/{code}")
    public R<Void> deletePrompt(@PathVariable String code) {
        promptService.deletePrompt(normalizePromptCode(code));
        return R.ok();
    }

    private String normalizePromptCode(String code) {
        return "shopping-guide".equals(code) ? AiPromptService.SHOPPING_GUIDE_CODE : code;
    }

    @PostMapping("/product-qa")
    public R<ScenarioReply> qa(@Valid @RequestBody ScenarioRequest req) {
        return R.ok(productQa.ask(req.getMessage()));
    }

    @PostMapping("/copywriting")
    public R<ScenarioReply> copy(@Valid @RequestBody ScenarioRequest req) {
        return R.ok(copywriting.generate(req.getMessage()));
    }

    @PostMapping("/generate-image")
    public R<GenerateImageResponse> image(@Valid @RequestBody GenerateImageRequest req) {
        return R.ok(contentGeneration.generateImage(req));
    }

    @PostMapping("/generate-video")
    public R<GenerateVideoResponse> video(@Valid @RequestBody GenerateVideoRequest req) {
        return R.ok(contentGeneration.generateVideo(req));
    }

    @GetMapping("/task-status/{taskId}")
    public R<AiTaskDTO> task(@PathVariable String taskId) {
        return R.ok(contentGeneration.status(taskId));
    }
}
