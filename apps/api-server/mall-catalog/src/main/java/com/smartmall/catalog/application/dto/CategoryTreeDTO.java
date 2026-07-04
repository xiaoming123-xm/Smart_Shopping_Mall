package com.smartmall.catalog.application.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * 分类树节点（用于后台分类树展示）。
 */
public class CategoryTreeDTO {

    private Long id;
    private Long parentId;
    private String name;
    private Integer sort;
    private Boolean enabled;
    private List<CategoryTreeDTO> children = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getSort() { return sort; }
    public void setSort(Integer sort) { this.sort = sort; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public List<CategoryTreeDTO> getChildren() { return children; }
    public void setChildren(List<CategoryTreeDTO> children) { this.children = children; }
}
