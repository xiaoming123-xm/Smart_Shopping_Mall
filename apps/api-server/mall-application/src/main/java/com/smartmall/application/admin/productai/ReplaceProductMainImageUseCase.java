package com.smartmall.application.admin.productai;

import com.smartmall.catalog.application.SpuAppService;
import com.smartmall.catalog.application.dto.SpuDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReplaceProductMainImageUseCase {
    private final SpuAppService spuAppService;

    public SpuDTO execute(Long productId, String imageUrl) {
        SpuDTO product = spuAppService.get(productId);
        product.setMainImage(imageUrl);
        return spuAppService.update(productId, product);
    }
}
