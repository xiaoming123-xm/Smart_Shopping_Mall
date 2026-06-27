package com.smartmall.inventory.application.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data public class StockDTO {
    private Long id; private Long skuId; private String skuCode;
    private Integer quantity; private Integer warnThreshold; private BigDecimal costPrice; private LocalDateTime updatedAt;
}
