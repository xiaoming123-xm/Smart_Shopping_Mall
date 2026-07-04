package com.smartmall.application.admin.selection;

import com.smartmall.selection.application.SelectionCrawlerTaskService;
import com.smartmall.selection.application.dto.CrawlerTaskDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QuerySelectionCrawlerStatusUseCase {
    private final SelectionCrawlerTaskService crawlerTaskService;

    public CrawlerTaskDTO execute(String taskId) {
        return crawlerTaskService.status(taskId);
    }
}
