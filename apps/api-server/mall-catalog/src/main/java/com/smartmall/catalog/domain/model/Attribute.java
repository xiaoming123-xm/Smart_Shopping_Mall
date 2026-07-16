package com.smartmall.catalog.domain.model;
import lombok.Data; import java.time.LocalDateTime;
@Data public class Attribute {
    private Long id; private Long parentId; private String name; private String type;
    private Boolean searchable; private Boolean required; private Integer sort;
    private LocalDateTime createdAt; private LocalDateTime updatedAt;
}
