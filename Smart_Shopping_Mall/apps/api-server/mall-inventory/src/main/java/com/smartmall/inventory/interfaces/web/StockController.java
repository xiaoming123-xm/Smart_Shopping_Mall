package com.smartmall.inventory.interfaces.web;
import com.smartmall.inventory.application.StockAppService;
import com.smartmall.inventory.application.dto.StockDTO;
import com.smartmall.inventory.application.dto.StockRecordDTO;
import com.smartmall.common.api.R;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController @RequestMapping("/api/inventory/stocks") @RequiredArgsConstructor
public class StockController {
    private final StockAppService svc;
    @GetMapping public R<List<StockDTO>> list(){ return R.ok(svc.list()); }
    @GetMapping("/sku/{skuId}") public R<StockDTO> getBySku(@PathVariable Long skuId){ return R.ok(svc.getBySku(skuId)); }
    @PostMapping("/in") public R<StockDTO> stockIn(@RequestBody Map<String,Object> body){
        return R.ok(svc.stockIn(num(body.get("skuId")), (int)num(body.get("qty")), str(body.get("remark"))));
    }
    @PostMapping("/out") public R<StockDTO> stockOut(@RequestBody Map<String,Object> body){
        return R.ok(svc.stockOut(num(body.get("skuId")), (int)num(body.get("qty")), str(body.get("remark"))));
    }
    @GetMapping("/sku/{skuId}/records") public R<List<StockRecordDTO>> records(@PathVariable Long skuId){ return R.ok(svc.records(skuId)); }
    private long num(Object o){ return o==null?0:Long.parseLong(o.toString()); }
    private String str(Object o){ return o==null?null:o.toString(); }
}
