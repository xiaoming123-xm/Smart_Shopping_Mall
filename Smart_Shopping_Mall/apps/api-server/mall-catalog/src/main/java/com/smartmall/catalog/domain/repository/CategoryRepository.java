package com.smartmall.catalog.domain.repository;

import com.smartmall.catalog.domain.model.Category;

import java.util.List;
import java.util.Optional;

/**
 * 分类仓储端口（领域层定义，基础设施层实现）。
 * 领域层只声明需要什么能力，不关心底层用 MySQL / 内存 / 其它存储。
 */
public interface CategoryRepository {

    Category save(Category category);

    Optional<Category> findById(Long id);

    List<Category> findAll();

    List<Category> findByParentId(Long parentId);

    boolean existsByParentIdAndName(Long parentId, String name, Long excludeId);

    boolean existsByParentId(Long parentId);

    void deleteById(Long id);
}
