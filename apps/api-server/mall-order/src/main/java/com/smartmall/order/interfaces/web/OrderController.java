package com.smartmall.order.interfaces.web;
import com.smartmall.order.application.OrderAppService;
import com.smartmall.order.application.command.CreateOrderCommand;
import com.smartmall.order.application.command.RefundHandleCommand;
import com.smartmall.order.application.command.RefundRequestCommand;
import com.smartmall.order.application.command.ReplyReviewCommand;
import com.smartmall.order.application.command.ReviewOrderCommand;
import com.smartmall.order.application.command.ShipOrderCommand;
import com.smartmall.order.application.dto.LogisticsTraceDTO;
import com.smartmall.order.application.dto.OrderDTO;
import com.smartmall.common.api.R;
import com.smartmall.inventory.application.StockAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/orders") @RequiredArgsConstructor
public class OrderController {
    private final OrderAppService svc;
    private final StockAppService stockAppService;
    @GetMapping public R<List<OrderDTO>> list(){ return R.ok(svc.list()); }
    @GetMapping("/reviews") public R<List<OrderDTO>> reviews(){ return R.ok(svc.reviews()); }
    @GetMapping("/{id}") public R<OrderDTO> get(@PathVariable Long id){ return R.ok(svc.get(id)); }
    @GetMapping("/{id}/logistics") public R<List<LogisticsTraceDTO>> logistics(@PathVariable Long id){ return R.ok(svc.logistics(id)); }
    @PostMapping public R<OrderDTO> create(@Valid @RequestBody CreateOrderCommand cmd){ return R.ok(svc.create(cmd)); }
    @PostMapping("/{id}/pay") public R<OrderDTO> pay(@PathVariable Long id){ return R.ok(svc.pay(id)); }
    @PostMapping("/{id}/ship") public R<OrderDTO> ship(@PathVariable Long id, @Valid @RequestBody(required=false) ShipOrderCommand cmd){
        OrderDTO order = cmd == null ? svc.ship(id) : svc.ship(id, cmd);
        if (order.getItems() != null) {
            order.getItems().forEach(item ->
                    stockAppService.stockOut(item.getSkuId(), item.getQuantity(), "订单发货扣减 订单号=" + order.getOrderNo()));
        }
        return R.ok(svc.get(id));
    }
    @PostMapping("/{id}/receive") public R<OrderDTO> receive(@PathVariable Long id){ return R.ok(svc.receive(id)); }
    @PostMapping("/{id}/complete") public R<OrderDTO> complete(@PathVariable Long id){ return R.ok(svc.complete(id)); }
    @PostMapping("/{id}/cancel") public R<OrderDTO> cancel(@PathVariable Long id){ return R.ok(svc.cancel(id)); }
    @PostMapping("/{id}/refund/request") public R<OrderDTO> requestRefund(@PathVariable Long id, @RequestBody(required=false) RefundRequestCommand cmd){ return R.ok(svc.requestRefund(id, cmd)); }
    @PostMapping("/{id}/refund/handle") public R<OrderDTO> handleRefund(@PathVariable Long id, @RequestBody(required=false) RefundHandleCommand cmd){ return R.ok(svc.handleRefund(id, cmd)); }
    @PostMapping("/{id}/review") public R<OrderDTO> review(@PathVariable Long id, @Valid @RequestBody ReviewOrderCommand cmd){ return R.ok(svc.review(id, cmd)); }
    @PostMapping("/{id}/review/reply") public R<OrderDTO> replyReview(@PathVariable Long id, @Valid @RequestBody ReplyReviewCommand cmd){ return R.ok(svc.replyReview(id, cmd)); }
}
