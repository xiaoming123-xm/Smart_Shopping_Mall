package com.smartmall.application.storefront.order.web;
import com.smartmall.application.storefront.order.PlaceOrderUseCase;
import com.smartmall.order.application.command.CreateOrderCommand;
import com.smartmall.common.api.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/checkout") @RequiredArgsConstructor
public class CheckoutController {
    private final PlaceOrderUseCase placeOrder;
    /** 下单(订单+库存+支付单 一体编排) */
    @PostMapping("/place-order") public R<PlaceOrderUseCase.Result> placeOrder(@Valid @RequestBody CreateOrderCommand cmd){
        return R.ok(placeOrder.place(cmd));
    }
}
