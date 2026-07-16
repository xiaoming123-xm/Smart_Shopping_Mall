package com.smartmall.application.storefront.order;

import com.smartmall.order.application.OrderAppService;
import com.smartmall.order.application.command.CreateOrderCommand;
import com.smartmall.order.application.dto.OrderDTO;
import com.smartmall.payment.application.PaymentAppService;
import com.smartmall.payment.application.command.CreatePaymentCommand;
import com.smartmall.payment.application.dto.PaymentDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PlaceOrderUseCase {
    private final OrderAppService orderApp;
    private final PaymentAppService paymentApp;

    @Transactional
    public Result place(CreateOrderCommand cmd) {
        OrderDTO order = orderApp.create(cmd);
        CreatePaymentCommand pc = new CreatePaymentCommand();
        pc.setOrderId(order.getId());
        pc.setChannel("MOCK");
        pc.setAmount(order.getTotalAmount());
        PaymentDTO payment = paymentApp.create(pc);
        return new Result(order, payment);
    }

    @Data
    public static class Result {
        private final OrderDTO order;
        private final PaymentDTO payment;
    }
}
