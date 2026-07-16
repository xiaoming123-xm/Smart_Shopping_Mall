package com.smartmall.application.admin.selection.web;

import com.smartmall.application.admin.selection.QuerySelectionCrawlerStatusUseCase;
import com.smartmall.application.admin.selection.StartSelectionCrawlerUseCase;
import com.smartmall.common.api.R;
import com.smartmall.selection.application.PddCrawlerSessionService;
import com.smartmall.selection.application.command.StartSelectionCrawlerCommand;
import com.smartmall.selection.application.dto.CrawlerTaskDTO;
import com.smartmall.selection.application.dto.PddCrawlerSessionDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/crawler")
@RequiredArgsConstructor
public class CrawlerController {
    private final StartSelectionCrawlerUseCase startSelectionCrawlerUseCase;
    private final QuerySelectionCrawlerStatusUseCase querySelectionCrawlerStatusUseCase;
    private final PddCrawlerSessionService pddCrawlerSessionService;

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

    @GetMapping("/pdd-session")
    public R<PddCrawlerSessionDTO> pddSession() {
        return R.ok(pddCrawlerSessionService.status());
    }

    @PostMapping("/pdd-session/open-login")
    public R<PddCrawlerSessionDTO> openPddLogin() throws IOException {
        return R.ok(pddCrawlerSessionService.openLoginWindow());
    }

    @PostMapping("/pdd-session/confirm")
    public R<PddCrawlerSessionDTO> confirmPddLogin(HttpServletRequest request) throws IOException {
        String username = String.valueOf(request.getAttribute("currentUsername"));
        return R.ok(pddCrawlerSessionService.confirmLoggedIn(username));
    }

    @PostMapping("/pdd-session/clear")
    public R<PddCrawlerSessionDTO> clearPddSession() throws IOException {
        return R.ok(pddCrawlerSessionService.clear());
    }
}
