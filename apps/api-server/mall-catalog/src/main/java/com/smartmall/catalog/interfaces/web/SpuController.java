package com.smartmall.catalog.interfaces.web;
import com.smartmall.catalog.application.CategoryAppService;
import com.smartmall.catalog.application.SpuAppService;
import com.smartmall.catalog.application.dto.SpuDTO;
import com.smartmall.catalog.application.dto.SkuDTO;
import com.smartmall.common.api.R;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController @RequestMapping("/api/catalog/products") @RequiredArgsConstructor
public class SpuController {
    private final CategoryAppService categoryAppService;
    private final SpuAppService svc;

    @GetMapping
    public R<List<SpuDTO>> list(@RequestParam(required = false) Long categoryId) {
        if (categoryId == null) {
            return R.ok(svc.list());
        }
        return R.ok(svc.listByCategoryIds(categoryAppService.categoryAndDescendantIds(categoryId)));
    }
    @GetMapping("/{id}") public R<SpuDTO> get(@PathVariable Long id){ return R.ok(svc.get(id)); }
    @PostMapping public R<SpuDTO> create(@RequestBody SpuDTO req){ return R.ok(svc.create(req)); }
    @PutMapping("/{id}") public R<SpuDTO> update(@PathVariable Long id,@RequestBody SpuDTO req){ return R.ok(svc.update(id,req)); }
    @DeleteMapping("/{id}") public R<Void> delete(@PathVariable Long id){ svc.delete(id); return R.ok(); }
    @PutMapping("/{id}/status") public R<SpuDTO> changeStatus(@PathVariable Long id,@RequestBody Map<String,Integer> body){ return R.ok(svc.changeStatus(id, body.get("status"))); }

    // SKU
    @GetMapping("/{spuId}/skus") public R<List<SkuDTO>> listSkus(@PathVariable Long spuId){ return R.ok(svc.listSkus(spuId)); }
    @PostMapping("/{spuId}/skus") public R<SkuDTO> addSku(@PathVariable Long spuId,@RequestBody SkuDTO req){ return R.ok(svc.addSku(spuId,req)); }
    @PutMapping("/skus/{skuId}") public R<SkuDTO> updateSku(@PathVariable Long skuId,@RequestBody SkuDTO req){ return R.ok(svc.updateSku(skuId,req)); }
    @DeleteMapping("/skus/{skuId}") public R<Void> deleteSku(@PathVariable Long skuId){ svc.deleteSku(skuId); return R.ok(); }
}
