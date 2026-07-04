package com.smartmall.selection.application;

import com.smartmall.selection.application.dto.SelectionCategoryDTO;
import com.smartmall.selection.infrastructure.persistence.SelectionDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SelectionCategoryService {
    private final SelectionDataStore store;

    public List<SelectionCategoryDTO> tree() {
        return store.categoryTree();
    }
}
