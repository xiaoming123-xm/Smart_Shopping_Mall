package com.smartmall.ai.interfaces.web;
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
    @PostMapping("/shopping-guide") public R<ScenarioReply> guide(@Valid @RequestBody ScenarioRequest req){ return R.ok(shoppingGuide.ask(req.getMessage())); }
    @PostMapping("/product-qa") public R<ScenarioReply> qa(@Valid @RequestBody ScenarioRequest req){ return R.ok(productQa.ask(req.getMessage())); }
    @PostMapping("/copywriting") public R<ScenarioReply> copy(@Valid @RequestBody ScenarioRequest req){ return R.ok(copywriting.generate(req.getMessage())); }
}
