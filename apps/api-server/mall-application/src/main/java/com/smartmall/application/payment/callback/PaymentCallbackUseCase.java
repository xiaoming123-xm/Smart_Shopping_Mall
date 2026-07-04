package com.smartmall.application.payment.callback;
import com.smartmall.order.application.OrderAppService;
import com.smartmall.payment.application.PaymentAppService;
import com.smartmall.payment.application.command.PaymentCallbackCommand;
import com.smartmall.payment.application.dto.PaymentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
/**
 * 支付回调编排: 处理渠道回调 -> 支付成功后回写订单为已支付。
 * 支付状态变更通过支付模块标准流程, 订单回写通过订单模块标准流程(Agent.md 4.4)。
 * 幂等性由支付模块 callback 保证。
 */
@Service @RequiredArgsConstructor public class PaymentCallbackUseCase {
    private final PaymentAppService paymentApp;
    private final OrderAppService orderApp;

    @Transactional public PaymentDTO handle(PaymentCallbackCommand cmd){
        PaymentDTO payment=paymentApp.callback(cmd);
        if("PAID".equals(payment.getStatus()) && payment.getOrderId()!=null){
            try { orderApp.pay(payment.getOrderId()); }
            catch (com.smartmall.common.exception.BizException ignore) { /* 订单已支付等状态, 回调幂等忽略 */ }
        }
        return payment;
    }
}
