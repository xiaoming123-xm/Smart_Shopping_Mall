package com.smartmall.catalog.infrastructure.persistence;

import com.smartmall.catalog.domain.model.Category;
import com.smartmall.catalog.domain.repository.CategoryRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * 内存实现的分类仓储。
 * 说明：教程复刻骨架阶段先用内存存储，保证后端不依赖 MySQL 即可运行；
 * 后续接入数据库时，只需新增一个实现 CategoryRepository 的 JPA/MyBatis 版本，
 * 领域层与应用层代码完全不用改（依赖倒置）。
 */
@Repository
public class InMemoryCategoryRepository implements CategoryRepository {

    private final Map<Long, Category> store = new ConcurrentHashMap<>();
    private final AtomicLong idGen = new AtomicLong(0);

    @PostConstruct
    public void seed() {
        // 初始化几条演示数据
        save(newCategory(0L, "手机数码", 1));
        Category clothes = save(newCategory(0L, "服装鞋包", 2));
        save(newCategory(0L, "家用电器", 3));
        save(newCategory(clothes.getId(), "男装", 1));
        save(newCategory(clothes.getId(), "女装", 2));
    }

    private Category newCategory(Long parentId, String name, int sort) {
        Category c = new Category();
        c.setParentId(parentId);
        c.setName(name);
        c.setSort(sort);
        c.setEnabled(true);
        return c;
    }

    @Override
    public Category save(Category category) {
        LocalDateTime now = LocalDateTime.now();
        if (category.getId() == null) {
            category.setId(idGen.incrementAndGet());
            category.setCreatedAt(now);
        } else {
            Category existing = store.get(category.getId());
            if (existing != null) {
                category.setCreatedAt(existing.getCreatedAt());
            }
        }
        category.setUpdatedAt(now);
        store.put(category.getId(), category);
        return category;
    }

    @Override
    public Optional<Category> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Category> findAll() {
        return store.values().stream()
                .sorted(Comparator.comparing(Category::getSort, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Category::getId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Category> findByParentId(Long parentId) {
        Long pid = parentId == null ? 0L : parentId;
        return store.values().stream()
                .filter(c -> pid.equals(c.getParentId()))
                .sorted(Comparator.comparing(Category::getSort, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Category::getId))
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByParentIdAndName(Long parentId, String name, Long excludeId) {
        Long pid = parentId == null ? 0L : parentId;
        return store.values().stream().anyMatch(c ->
                pid.equals(c.getParentId())
                        && c.getName().equals(name)
                        && (excludeId == null || !excludeId.equals(c.getId())));
    }

    @Override
    public boolean existsByParentId(Long parentId) {
        return store.values().stream().anyMatch(c -> parentId.equals(c.getParentId()));
    }

    @Override
    public void deleteById(Long id) {
        store.remove(id);
    }
}
