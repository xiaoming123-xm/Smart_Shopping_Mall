package com.smartmall.order.interfaces.web;
import com.smartmall.order.application.OrderAppService;
import com.smartmall.order.application.dto.OrderDTO;
import com.smartmall.common.api.R;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/orders") @RequiredArgsConstructor
public class OrderController {
    private final OrderAppService svc;
    @GetMapping public R<List<OrderDTO>> list(){ return R.ok(svc.list()); }
    @GetMapping("/{id}") public R<OrderDTO> get(@PathVariable Long id){ return R.ok(svc.get(id)); }
    @PostMapping("/{id}/ship") public R<OrderDTO> ship(@PathVariable Long id){ return R.ok(svc.ship(id)); }
}
