package com.smartmall.ai.interfaces.web;
import com.smartmall.ai.content.*;
import com.smartmall.ai.scenario.*;
import com.smartmall.common.api.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/ai") @RequiredArgsConstructor
public class AiController {
    private final ShoppingGuideService shoppingGuide;
    private final ProductQaService productQa;
    private final CopywritingService copywriting;
    private final AiContentGenerationService contentGeneration;
    @PostMapping("/shopping-guide") public R<ScenarioReply> guide(@Valid @RequestBody ScenarioRequest req){ return R.ok(shoppingGuide.ask(req.getMessage())); }
    @PostMapping("/product-qa") public R<ScenarioReply> qa(@Valid @RequestBody ScenarioRequest req){ return R.ok(productQa.ask(req.getMessage())); }
    @PostMapping("/copywriting") public R<ScenarioReply> copy(@Valid @RequestBody ScenarioRequest req){ return R.ok(copywriting.generate(req.getMessage())); }
    @PostMapping("/generate-image") public R<GenerateImageResponse> image(@Valid @RequestBody GenerateImageRequest req){ return R.ok(contentGeneration.generateImage(req)); }
    @PostMapping("/generate-video") public R<GenerateVideoResponse> video(@Valid @RequestBody GenerateVideoRequest req){ return R.ok(contentGeneration.generateVideo(req)); }
    @GetMapping("/task-status/{taskId}") public R<AiTaskDTO> task(@PathVariable String taskId){ return R.ok(contentGeneration.status(taskId)); }
}
