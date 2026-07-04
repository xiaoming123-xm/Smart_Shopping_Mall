package com.smartmall.application.payment.callback.web;
import com.smartmall.application.payment.callback.PaymentCallbackUseCase;
import com.smartmall.payment.application.command.PaymentCallbackCommand;
import com.smartmall.payment.application.dto.PaymentDTO;
import com.smartmall.common.api.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/payment-callback") @RequiredArgsConstructor
public class PaymentCallbackController {
    private final PaymentCallbackUseCase useCase;
    /** 渠道支付回调(编排: 支付回写 + 订单回写)。幂等。 */
    @PostMapping public R<PaymentDTO> callback(@Valid @RequestBody PaymentCallbackCommand cmd){
        return R.ok(useCase.handle(cmd));
    }
}
