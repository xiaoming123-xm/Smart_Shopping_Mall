package com.smartmall.catalog.domain.model;
import lombok.Data;
import java.time.LocalDateTime;
@Data public class Brand {
    private Long id; private String name; private String logo; private String description;
    private Boolean enabled; private Integer sort; private LocalDateTime createdAt; private LocalDateTime updatedAt;
}