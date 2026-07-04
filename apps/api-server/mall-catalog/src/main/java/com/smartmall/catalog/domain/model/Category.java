package com.smartmall.catalog.domain.model;

import java.time.LocalDateTime;

/**
 * 分类领域模型（商品中心 - 分类管理）。
 * 纯领域对象，不依赖任何框架注解。
 */
public class Category {

    private Long id;
    private Long parentId;   // 0 表示顶级分类
    private String name;
    private Integer sort;    // 排序值，越小越靠前
    private Boolean enabled; // 是否启用
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Category() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getSort() {
        return sort;
    }

    public void setSort(Integer sort) {
        this.sort = sort;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isTopLevel() {
        return parentId == null || parentId == 0L;
    }
}
