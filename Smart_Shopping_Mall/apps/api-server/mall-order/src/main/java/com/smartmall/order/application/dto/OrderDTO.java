package com.smartmall.order.application.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data public class OrderDTO {
    private Long id; private String orderNo; private Long memberId; private String status; private BigDecimal totalAmount;
    private String receiver; private String address; private LocalDateTime createdAt; private List<OrderItemDTO> items;
}
