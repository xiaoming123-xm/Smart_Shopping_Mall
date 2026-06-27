package com.smartmall.inventory.application.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data public class StockRecordDTO {
    private Long id; private Long skuId; private String type; private Integer change; private Integer after; private String remark; private LocalDateTime createdAt;
}
