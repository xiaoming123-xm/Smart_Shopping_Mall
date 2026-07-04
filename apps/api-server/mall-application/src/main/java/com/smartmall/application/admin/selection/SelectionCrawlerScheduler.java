package com.smartmall.application.admin.selection;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SelectionCrawlerScheduler {
    private static final Logger log = LoggerFactory.getLogger(SelectionCrawlerScheduler.class);
    private final StartSelectionCrawlerUseCase startSelectionCrawlerUseCase;

    @Scheduled(cron = "0 0 2 * * *")
    public void refreshSelectionRankings() {
        try {
            startSelectionCrawlerUseCase.executeScheduled();
        } catch (Exception ex) {
            log.warn("scheduled selection crawler skipped: {}", ex.getMessage());
        }
    }
}
