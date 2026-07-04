package com.smartmall.catalog.interfaces.web;
import com.smartmall.catalog.application.AttributeAppService; import com.smartmall.catalog.application.dto.AttributeDTO; import com.smartmall.catalog.domain.model.AttributeValue;
import com.smartmall.common.api.R; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/catalog/attributes") @RequiredArgsConstructor
public class AttributeController {
    private final AttributeAppService svc;
    @GetMapping public R<List<AttributeDTO>> list(){ return R.ok(svc.list()); }
    @GetMapping("/{id}") public R<AttributeDTO> get(@PathVariable Long id){ return R.ok(svc.get(id)); }
    @PostMapping public R<AttributeDTO> create(@RequestBody AttributeDTO req){ return R.ok(svc.create(req)); }
    @PutMapping("/{id}") public R<AttributeDTO> update(@PathVariable Long id,@RequestBody AttributeDTO req){ return R.ok(svc.update(id,req)); }
    @DeleteMapping("/{id}") public R<Void> delete(@PathVariable Long id){ svc.delete(id); return R.ok(); }
    @PostMapping("/{attrId}/values") public R<AttributeValue> addValue(@PathVariable Long attrId,@RequestBody Map<String,Object> body){ return R.ok(svc.addValue(attrId,(String)body.get("value"),body.get("sort")!=null?((Number)body.get("sort")).intValue():null)); }
    @DeleteMapping("/values/{valId}") public R<Void> deleteValue(@PathVariable Long valId){ svc.deleteValue(valId); return R.ok(); }
}