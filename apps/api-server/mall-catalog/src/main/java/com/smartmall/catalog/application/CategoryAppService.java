package com.smartmall.catalog.application;

import com.smartmall.catalog.application.command.CreateCategoryCommand;
import com.smartmall.catalog.application.command.UpdateCategoryCommand;
import com.smartmall.catalog.application.dto.CategoryDTO;
import com.smartmall.catalog.application.dto.CategoryTreeDTO;
import com.smartmall.catalog.domain.model.Category;
import com.smartmall.catalog.domain.repository.CategoryRepository;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 分类应用服务（商品中心 - 分类管理）。
 *
 * 架构说明：这是 mall-catalog 模块"自己的 application 层"，
 * 只编排本模块（catalog 单业务域）内部的业务规则与仓储调用。
 * 它不跨模块，因此不放在 mall-application。
 * 只有当一个流程需要同时编排 catalog + inventory + order 等多个模块时，
 * 才会上升到 mall-application 的 UseCase 中。
 */
@Service
public class CategoryAppService {

    private final CategoryRepository categoryRepository;

    public CategoryAppService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /** 创建分类 */
    @Transactional
    public CategoryDTO create(CreateCategoryCommand cmd) {
        Long parentId = cmd.getParentId() == null ? 0L : cmd.getParentId();

        // 父级必须存在（顶级除外）
        if (parentId != 0L && categoryRepository.findById(parentId).isEmpty()) {
            throw new BizException(ResultCode.CATEGORY_PARENT_INVALID);
        }
        // 同级名称唯一
        if (categoryRepository.existsByParentIdAndName(parentId, cmd.getName(), null)) {
            throw new BizException(ResultCode.CATEGORY_NAME_DUPLICATE);
        }

        Category category = new Category();
        category.setParentId(parentId);
        category.setName(cmd.getName());
        category.setSort(cmd.getSort() == null ? 0 : cmd.getSort());
        category.setEnabled(cmd.getEnabled() == null ? Boolean.TRUE : cmd.getEnabled());

        return toDTO(categoryRepository.save(category));
    }

    /** 更新分类 */
    @Transactional
    public CategoryDTO update(UpdateCategoryCommand cmd) {
        Category category = categoryRepository.findById(cmd.getId())
                .orElseThrow(() -> new BizException(ResultCode.CATEGORY_NOT_FOUND));

        if (cmd.getName() != null && !cmd.getName().equals(category.getName())) {
            if (categoryRepository.existsByParentIdAndName(category.getParentId(), cmd.getName(), category.getId())) {
                throw new BizException(ResultCode.CATEGORY_NAME_DUPLICATE);
            }
            category.setName(cmd.getName());
        }
        if (cmd.getSort() != null) {
            category.setSort(cmd.getSort());
        }
        if (cmd.getEnabled() != null) {
            category.setEnabled(cmd.getEnabled());
        }
        return toDTO(categoryRepository.save(category));
    }

    /** 删除分类（存在子分类时禁止删除） */
    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BizException(ResultCode.CATEGORY_NOT_FOUND));
        if (categoryRepository.existsByParentId(category.getId())) {
            throw new BizException(ResultCode.CATEGORY_HAS_CHILDREN);
        }
        categoryRepository.deleteById(id);
    }

    /** 详情 */
    public CategoryDTO get(Long id) {
        return categoryRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new BizException(ResultCode.CATEGORY_NOT_FOUND));
    }

    /** 按父级查询直接子分类列表 */
    public List<CategoryDTO> listByParent(Long parentId) {
        List<CategoryDTO> result = new ArrayList<>();
        for (Category c : categoryRepository.findByParentId(parentId == null ? 0L : parentId)) {
            result.add(toDTO(c));
        }
        return result;
    }

    /** 完整分类树 */
    public List<CategoryTreeDTO> tree() {
        List<Category> all = categoryRepository.findAll();
        Map<Long, CategoryTreeDTO> nodeMap = new LinkedHashMap<>();
        for (Category c : all) {
            nodeMap.put(c.getId(), toTreeNode(c));
        }
        List<CategoryTreeDTO> roots = new ArrayList<>();
        for (Category c : all) {
            CategoryTreeDTO node = nodeMap.get(c.getId());
            Long pid = c.getParentId() == null ? 0L : c.getParentId();
            if (pid == 0L) {
                roots.add(node);
            } else {
                CategoryTreeDTO parent = nodeMap.get(pid);
                if (parent != null) {
                    parent.getChildren().add(node);
                } else {
                    roots.add(node);
                }
            }
        }
        return roots;
    }

    /** 分类本身及全部下级分类 ID，用于前台根分类筛选商品。 */
    public List<Long> categoryAndDescendantIds(Long id) {
        categoryRepository.findById(id)
                .orElseThrow(() -> new BizException(ResultCode.CATEGORY_NOT_FOUND));
        List<Long> ids = new ArrayList<>();
        collectCategoryIds(id, ids);
        return ids;
    }

    private void collectCategoryIds(Long id, List<Long> ids) {
        ids.add(id);
        for (Category child : categoryRepository.findByParentId(id)) {
            collectCategoryIds(child.getId(), ids);
        }
    }

    private CategoryDTO toDTO(Category c) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(c.getId());
        dto.setParentId(c.getParentId());
        dto.setName(c.getName());
        dto.setSort(c.getSort());
        dto.setEnabled(c.getEnabled());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }

    private CategoryTreeDTO toTreeNode(Category c) {
        CategoryTreeDTO node = new CategoryTreeDTO();
        node.setId(c.getId());
        node.setParentId(c.getParentId());
        node.setName(c.getName());
        node.setSort(c.getSort());
        node.setEnabled(c.getEnabled());
        return node;
    }
}
