package com.smartmall.catalog.application.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data public class SpuDTO {
    private Long id;
    private String name;
    private Long categoryId;
    private Long brandId;
    private String mainImage;
    private String description;
    private String attributesJson;
    private BigDecimal price;
    private BigDecimal costPrice;
    private Integer stock;
    private Integer status;
    private Integer sort;
    private LocalDateTime createdAt;
    private List<SkuDTO> skus;
}
