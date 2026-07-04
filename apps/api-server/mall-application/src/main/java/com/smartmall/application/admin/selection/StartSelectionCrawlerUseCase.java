package com.smartmall.application.admin.selection;

import com.smartmall.selection.application.SelectionCrawlerTaskService;
import com.smartmall.selection.application.command.StartSelectionCrawlerCommand;
import com.smartmall.selection.application.dto.CrawlerTaskDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StartSelectionCrawlerUseCase {
    private final SelectionCrawlerTaskService crawlerTaskService;

    public CrawlerTaskDTO execute(StartSelectionCrawlerCommand command, String currentUsername) {
        return crawlerTaskService.start(command, "MANUAL", currentUsername);
    }

    public CrawlerTaskDTO executeScheduled() {
        StartSelectionCrawlerCommand command = new StartSelectionCrawlerCommand();
        return crawlerTaskService.start(command, "SCHEDULED", "system");
    }
}
