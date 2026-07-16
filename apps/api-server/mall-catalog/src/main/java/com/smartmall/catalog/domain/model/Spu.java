package com.smartmall.catalog.domain.model;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data public class Spu {
    private Long id;
    private String name;
    private Long categoryId;
    private Long brandId;
    private String mainImage;
    private String description;
    private String attributesJson;
    private BigDecimal price;        // 销售价(展示)
    private BigDecimal costPrice;    // 成本价(财务增强预留)
    private Integer stock;           // 冗余库存(展示用,真实库存在 mall-inventory)
    private Integer status;          // 0=下架 1=上架
    private Integer sort;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
