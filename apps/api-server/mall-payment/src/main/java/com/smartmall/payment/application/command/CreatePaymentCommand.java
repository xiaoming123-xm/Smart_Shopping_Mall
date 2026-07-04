package com.smartmall.payment.application.command;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
@Data public class CreatePaymentCommand {
    @NotNull private Long orderId;
    @NotBlank private String channel;   // ALIPAY / WECHAT / MOCK
    @NotNull @DecimalMin(value="0.0", inclusive=false) private BigDecimal amount;
}
