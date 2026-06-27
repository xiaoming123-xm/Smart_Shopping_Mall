package com.smartmall.catalog.application.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data public class BrandDTO { private Long id; private String name; private String logo; private String description; private Boolean enabled; private Integer sort; private LocalDateTime createdAt; }