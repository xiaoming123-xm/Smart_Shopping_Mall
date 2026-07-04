package com.smartmall.catalog.interfaces.web;
import com.smartmall.catalog.application.BrandAppService;
import com.smartmall.catalog.application.dto.BrandDTO;
import com.smartmall.common.api.R;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/catalog/brands") @RequiredArgsConstructor
public class BrandController {
    private final BrandAppService svc;
    @GetMapping public R<List<BrandDTO>> list(){ return R.ok(svc.list()); }
    @GetMapping("/{id}") public R<BrandDTO> get(@PathVariable Long id){ return R.ok(svc.get(id)); }
    @PostMapping public R<BrandDTO> create(@RequestBody BrandDTO req){ return R.ok(svc.create(req)); }
    @PutMapping("/{id}") public R<BrandDTO> update(@PathVariable Long id,@RequestBody BrandDTO req){ return R.ok(svc.update(id,req)); }
    @DeleteMapping("/{id}") public R<Void> delete(@PathVariable Long id){ svc.delete(id); return R.ok(); }
}