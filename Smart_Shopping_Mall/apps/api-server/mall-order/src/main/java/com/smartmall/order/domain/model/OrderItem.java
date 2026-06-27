package com.smartmall.order.domain.model;
import lombok.Data;
import java.math.BigDecimal;
@Data public class OrderItem {
    private Long id;
    private Long orderId;
    private Long skuId;
    private String skuCode;
    private String productName;
    private BigDecimal price;
    private Integer quantity;
}
