package com.smartmall.selection.application.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class SelectionCategoryDTO {
    private Long id;
    private Long parentId;
    private String categoryName;
    private String keyword;
    private Integer level;
    private Integer sortOrder;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SelectionCategoryDTO> children = new ArrayList<>();
}
