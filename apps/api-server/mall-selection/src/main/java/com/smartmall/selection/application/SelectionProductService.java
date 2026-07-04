package com.smartmall.selection.application;

import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import com.smartmall.selection.application.dto.SelectionProductDTO;
import com.smartmall.selection.infrastructure.persistence.SelectionDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SelectionProductService {
    private final SelectionDataStore store;

    public List<SelectionProductDTO> list(Long categoryId, String sort, String order) {
        if (categoryId != null && store.findCategory(categoryId).isEmpty()) {
            throw new BizException(ResultCode.SELECTION_CATEGORY_NOT_FOUND);
        }
        return store.listProducts(categoryId, sort, order);
    }
}
