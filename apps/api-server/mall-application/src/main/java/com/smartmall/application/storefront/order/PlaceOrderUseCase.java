package com.smartmall.application.storefront.order;
import com.smartmall.order.application.OrderAppService;
import com.smartmall.order.application.command.CreateOrderCommand;
import com.smartmall.order.application.dto.OrderDTO;
import com.smartmall.order.application.dto.OrderItemDTO;
import com.smartmall.inventory.application.StockAppService;
import com.smartmall.payment.application.PaymentAppService;
import com.smartmall.payment.application.command.CreatePaymentCommand;
import com.smartmall.payment.application.dto.PaymentDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
/**
 * 下单跨模块编排: 创建订单 -> 扣减库存 -> 创建支付单(待支付)。
 * 单模块内部逻辑各自负责, 这里只做流程编排(Agent.md 4.1/4.4)。
 */
@Service @RequiredArgsConstructor public class PlaceOrderUseCase {
    private final OrderAppService orderApp;
    private final StockAppService stockApp;
    private final PaymentAppService paymentApp;

    @Transactional public Result place(CreateOrderCommand cmd){
        OrderDTO order=orderApp.create(cmd);
        for(OrderItemDTO it: order.getItems()){
            stockApp.stockOut(it.getSkuId(), it.getQuantity(), "下单扣减 订单号="+order.getOrderNo());
        }
        CreatePaymentCommand pc=new CreatePaymentCommand();
        pc.setOrderId(order.getId()); pc.setChannel("MOCK"); pc.setAmount(order.getTotalAmount());
        PaymentDTO payment=paymentApp.create(pc);
        return new Result(order, payment);
    }
    @Data public static class Result { private final OrderDTO order; private final PaymentDTO payment; }
}
