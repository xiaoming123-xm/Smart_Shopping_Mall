package com.smartmall.payment.application.command;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
@Data public class PaymentCallbackCommand {
    @NotNull private Long paymentId;
    @NotBlank private String tradeStatus;   // SUCCESS / FAIL (渠道回调状态)
    private BigDecimal amount;               // 渠道回传金额, 用于校验
}
