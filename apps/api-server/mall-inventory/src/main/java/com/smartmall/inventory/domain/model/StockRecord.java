package com.smartmall.inventory.domain.model;
import lombok.Data;
import java.time.LocalDateTime;
@Data public class StockRecord {
    private Long id;
    private Long skuId;
    private String type;     // IN=入库 OUT=出库
    private Integer change;  // 变更数量(正负)
    private Integer after;   // 变更后库存
    private String remark;
    private LocalDateTime createdAt;
}
