package com.smartmall.selection.application;

import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import com.smartmall.selection.application.command.StartSelectionCrawlerCommand;
import com.smartmall.selection.application.dto.CrawlerTaskDTO;
import com.smartmall.selection.infrastructure.persistence.SelectionDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
public class SelectionCrawlerTaskService {
    private final SelectionDataStore store;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    public CrawlerTaskDTO start(StartSelectionCrawlerCommand command, String triggerType, String createdBy) {
        Long categoryId = command == null ? null : command.getCategoryId();
        if (categoryId != null && store.findCategory(categoryId).isEmpty()) {
            throw new BizException(ResultCode.SELECTION_CATEGORY_NOT_FOUND);
        }
        if (store.hasRunningTask(categoryId)) {
            throw new BizException(ResultCode.CRAWLER_TASK_ALREADY_RUNNING);
        }

        CrawlerTaskDTO task = new CrawlerTaskDTO();
        task.setTaskId("sel-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        task.setPlatform("PDD");
        task.setCategoryId(categoryId);
        task.setKeyword(command == null ? null : command.getKeyword());
        task.setStatus("PENDING");
        task.setTriggerType(triggerType == null ? "MANUAL" : triggerType);
        task.setTotalCount(0);
        task.setSuccessCount(0);
        task.setRetryCount(0);
        task.setCreatedBy(createdBy == null ? "admin" : createdBy);
        task.setCreatedAt(LocalDateTime.now());
        store.saveTask(task);

        executor.submit(() -> runTask(task.getTaskId()));
        return task;
    }

    public CrawlerTaskDTO status(String taskId) {
        return store.findTask(taskId).orElseThrow(() -> new BizException(ResultCode.CRAWLER_TASK_NOT_FOUND));
    }

    private void runTask(String taskId) {
        CrawlerTaskDTO task = store.getMutableTask(taskId);
        if (task == null) {
            return;
        }
        try {
            task.setStatus("RUNNING");
            task.setStartedAt(LocalDateTime.now());
            Thread.sleep(900);
            int count = store.refreshProducts(task.getCategoryId(), task.getKeyword(), taskId);
            task.setTotalCount(count);
            task.setSuccessCount(count);
            task.setStatus("SUCCESS");
            task.setFinishedAt(LocalDateTime.now());
        } catch (Exception ex) {
            task.setStatus("FAILED");
            task.setFailReason(ex.getMessage());
            task.setFinishedAt(LocalDateTime.now());
        }
    }
}
