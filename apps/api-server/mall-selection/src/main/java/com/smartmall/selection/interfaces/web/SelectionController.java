package com.smartmall.selection.interfaces.web;

import com.smartmall.common.api.R;
import com.smartmall.selection.application.SelectionCategoryService;
import com.smartmall.selection.application.SelectionProductService;
import com.smartmall.selection.application.dto.SelectionCategoryDTO;
import com.smartmall.selection.application.dto.SelectionProductDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/selection")
@RequiredArgsConstructor
public class SelectionController {
    private final SelectionCategoryService categoryService;
    private final SelectionProductService productService;

    @GetMapping("/categories")
    public R<List<SelectionCategoryDTO>> categories() {
        return R.ok(categoryService.tree());
    }

    @GetMapping("/products")
    public R<List<SelectionProductDTO>> products(@RequestParam(name = "category_id", required = false) Long categoryId,
                                                 @RequestParam(required = false, defaultValue = "sales") String sort,
                                                 @RequestParam(required = false, defaultValue = "desc") String order) {
        return R.ok(productService.list(categoryId, sort, order));
    }
}
