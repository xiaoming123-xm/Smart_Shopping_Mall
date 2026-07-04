package com.smartmall.application.admin.selection.web;

import com.smartmall.application.admin.selection.QuerySelectionCrawlerStatusUseCase;
import com.smartmall.application.admin.selection.StartSelectionCrawlerUseCase;
import com.smartmall.common.api.R;
import com.smartmall.selection.application.command.StartSelectionCrawlerCommand;
import com.smartmall.selection.application.dto.CrawlerTaskDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crawler")
@RequiredArgsConstructor
public class CrawlerController {
    private final StartSelectionCrawlerUseCase startSelectionCrawlerUseCase;
    private final QuerySelectionCrawlerStatusUseCase querySelectionCrawlerStatusUseCase;

    @PostMapping("/start-selection")
    public R<CrawlerTaskDTO> startSelection(@RequestBody(required = false) StartSelectionCrawlerCommand command,
                                            HttpServletRequest request) {
        String username = String.valueOf(request.getAttribute("currentUsername"));
        return R.ok(startSelectionCrawlerUseCase.execute(command == null ? new StartSelectionCrawlerCommand() : command, username));
    }

    @GetMapping("/status/{taskId}")
    public R<CrawlerTaskDTO> status(@PathVariable String taskId) {
        return R.ok(querySelectionCrawlerStatusUseCase.execute(taskId));
    }
}
