package com.smartmall.payment.domain.model;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data public class Payment {
    private Long id;
    private String paymentNo;     // 资金单号
    private Long orderId;          // 关联业务单(订单)
    private String channel;        // ALIPAY / WECHAT / MOCK
    private String status;         // PENDING 待支付, PAID 已支付, REFUNDING 退款中, REFUNDED 已退款
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
