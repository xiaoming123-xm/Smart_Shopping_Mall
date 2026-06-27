package com.smartmall.catalog.domain.model;
import lombok.Data;
import java.math.BigDecimal;
@Data public class Sku {
    private Long id;
    private Long spuId;
    private String skuCode;
    private String specs;            // 规格描述,如 "红色/XL"
    private BigDecimal price;        // 销售价
    private BigDecimal costPrice;    // 成本价(财务增强预留)
    private Integer stock;           // 冗余库存
    private Integer status;          // 0=停用 1=启用
}
