package com.smartmall.catalog.interfaces.web;

import com.smartmall.catalog.application.CategoryAppService;
import com.smartmall.catalog.application.command.CreateCategoryCommand;
import com.smartmall.catalog.application.command.UpdateCategoryCommand;
import com.smartmall.catalog.application.dto.CategoryDTO;
import com.smartmall.catalog.application.dto.CategoryTreeDTO;
import com.smartmall.catalog.interfaces.web.request.CreateCategoryRequest;
import com.smartmall.catalog.interfaces.web.request.UpdateCategoryRequest;
import com.smartmall.common.api.R;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 分类管理接口（商品中心）。
 *
 * 架构说明：Controller 只做参数适配 + 调用本模块的 application 服务，
 * 不写任何业务规则，也不直接访问仓储或其它模块。
 */
@RestController
@RequestMapping("/api/catalog/categories")
public class CategoryController {

    private final CategoryAppService categoryAppService;

    public CategoryController(CategoryAppService categoryAppService) {
        this.categoryAppService = categoryAppService;
    }

    /** 分类树 */
    @GetMapping("/tree")
    public R<List<CategoryTreeDTO>> tree() {
        return R.ok(categoryAppService.tree());
    }

    /** 按父级查询子分类（parentId 不传则查顶级） */
    @GetMapping
    public R<List<CategoryDTO>> list(@RequestParam(required = false) Long parentId) {
        return R.ok(categoryAppService.listByParent(parentId));
    }

    /** 详情 */
    @GetMapping("/{id}")
    public R<CategoryDTO> get(@PathVariable Long id) {
        return R.ok(categoryAppService.get(id));
    }

    /** 新增 */
    @PostMapping
    public R<CategoryDTO> create(@Valid @RequestBody CreateCategoryRequest request) {
        CreateCategoryCommand cmd = new CreateCategoryCommand();
        cmd.setParentId(request.getParentId());
        cmd.setName(request.getName());
        cmd.setSort(request.getSort());
        cmd.setEnabled(request.getEnabled());
        return R.ok(categoryAppService.create(cmd));
    }

    /** 更新 */
    @PutMapping("/{id}")
    public R<CategoryDTO> update(@PathVariable Long id, @Valid @RequestBody UpdateCategoryRequest request) {
        UpdateCategoryCommand cmd = new UpdateCategoryCommand();
        cmd.setId(id);
        cmd.setName(request.getName());
        cmd.setSort(request.getSort());
        cmd.setEnabled(request.getEnabled());
        return R.ok(categoryAppService.update(cmd));
    }

    /** 删除 */
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        categoryAppService.delete(id);
        return R.ok();
    }
}
