package com.smartmall.order.domain.model;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data public class Order {
    private Long id;
    private String orderNo;
    private Long memberId;
    private String status;       // CREATED 待支付, PAID 已支付, SHIPPED 已发货, COMPLETED 已完成, CANCELLED 已取消
    private BigDecimal totalAmount;
    private String receiver;
    private String address;
    private LocalDateTime createdAt;
    private List<OrderItem> items;
}
