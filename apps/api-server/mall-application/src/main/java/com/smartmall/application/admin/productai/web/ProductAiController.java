package com.smartmall.application.admin.productai.web;

import com.smartmall.application.admin.productai.ReplaceProductMainImageUseCase;
import com.smartmall.catalog.application.dto.SpuDTO;
import com.smartmall.common.api.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class ProductAiController {
    private final ReplaceProductMainImageUseCase replaceProductMainImageUseCase;

    @PostMapping("/replace-main-image")
    public R<SpuDTO> replaceMainImage(@Valid @RequestBody ReplaceMainImageRequest request) {
        return R.ok(replaceProductMainImageUseCase.execute(request.getProductId(), request.getImageUrl()));
    }
}
