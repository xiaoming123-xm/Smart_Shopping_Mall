package com.smartmall.order.application.dto;
import lombok.Data;
import java.math.BigDecimal;
@Data public class OrderItemDTO {
    private Long id; private Long skuId; private String skuCode; private String productName; private BigDecimal price; private Integer quantity;
}
