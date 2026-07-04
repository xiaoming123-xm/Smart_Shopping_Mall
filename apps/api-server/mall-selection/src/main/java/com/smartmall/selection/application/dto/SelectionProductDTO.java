package com.smartmall.selection.application.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SelectionProductDTO {
    private Long id;
    private Long categoryId;
    private String platform;
    private String sourceProductId;
    private String productName;
    private String imageUrl;
    private String sourceUrl;
    private Integer sales7d;
    private BigDecimal avgPrice;
    private BigDecimal profitEstimate;
    private String trendTag;
    private String competitionLevel;
    private Integer rankNo;
    private LocalDateTime fetchedAt;
}
