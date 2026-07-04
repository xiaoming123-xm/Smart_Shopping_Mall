package com.smartmall.inventory.interfaces.web;
import com.smartmall.inventory.application.StockAppService;
import com.smartmall.inventory.application.dto.StockDTO;
import com.smartmall.inventory.application.dto.StockRecordDTO;
import com.smartmall.inventory.interfaces.web.request.StockChangeRequest;
import com.smartmall.common.api.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/inventory/stocks") @RequiredArgsConstructor
public class StockController {
    private final StockAppService svc;
    @GetMapping public R<List<StockDTO>> list(){ return R.ok(svc.list()); }
    @GetMapping("/sku/{skuId}") public R<StockDTO> getBySku(@PathVariable Long skuId){ return R.ok(svc.getBySku(skuId)); }
    @PostMapping("/in") public R<StockDTO> stockIn(@Valid @RequestBody StockChangeRequest req){
        return R.ok(svc.stockIn(req.getSkuId(), req.getQty(), req.getRemark()));
    }
    @PostMapping("/out") public R<StockDTO> stockOut(@Valid @RequestBody StockChangeRequest req){
        return R.ok(svc.stockOut(req.getSkuId(), req.getQty(), req.getRemark()));
    }
    @GetMapping("/sku/{skuId}/records") public R<List<StockRecordDTO>> records(@PathVariable Long skuId){ return R.ok(svc.records(skuId)); }
}
