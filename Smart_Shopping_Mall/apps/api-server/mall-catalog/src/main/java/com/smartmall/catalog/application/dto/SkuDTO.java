package com.smartmall.catalog.application.dto;
import lombok.Data;
import java.math.BigDecimal;
@Data public class SkuDTO {
    private Long id;
    private Long spuId;
    private String skuCode;
    private String specs;
    private BigDecimal price;
    private BigDecimal costPrice;
    private Integer stock;
    private Integer status;
}
