package com.smartmall.catalog.application.dto;
import com.smartmall.catalog.domain.model.AttributeValue; import lombok.Data; import java.time.LocalDateTime; import java.util.ArrayList; import java.util.List;
@Data public class AttributeDTO {
    private Long id; private Long parentId; private String name; private String type; private Boolean searchable; private Boolean required; private Integer sort; private LocalDateTime createdAt;
    private List<AttributeValue> values; private List<Long> categoryIds = new ArrayList<>(); private List<AttributeDTO> children = new ArrayList<>();
}
