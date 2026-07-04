package com.smartmall.payment.application.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data public class PaymentDTO {
    private Long id; private String paymentNo; private Long orderId; private String channel; private String status;
    private BigDecimal amount; private LocalDateTime createdAt; private LocalDateTime paidAt;
}
