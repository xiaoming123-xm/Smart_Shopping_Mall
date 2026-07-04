package com.smartmall.inventory.domain.model;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data public class Stock {
    private Long id;
    private Long skuId;
    private String skuCode;
    private Integer quantity;        // 可用库存
    private Integer warnThreshold;   // 预警阈值
    private BigDecimal costPrice;    // 库存成本单价(财务增强预留:库存资金占用)
    private LocalDateTime updatedAt;
}
