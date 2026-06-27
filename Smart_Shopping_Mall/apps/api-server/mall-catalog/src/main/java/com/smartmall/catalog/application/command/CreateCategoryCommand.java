package com.smartmall.catalog.application.command;

/**
 * 创建分类命令。
 */
public class CreateCategoryCommand {

    private Long parentId;
    private String name;
    private Integer sort;
    private Boolean enabled;

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getSort() { return sort; }
    public void setSort(Integer sort) { this.sort = sort; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}
