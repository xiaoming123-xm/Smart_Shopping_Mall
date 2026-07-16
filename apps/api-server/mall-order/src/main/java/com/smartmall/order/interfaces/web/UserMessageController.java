package com.smartmall.order.interfaces.web;

import com.smartmall.common.api.R;
import com.smartmall.order.application.UserMessageAppService;
import com.smartmall.order.application.dto.UserMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class UserMessageController {
    private final UserMessageAppService svc;

    @GetMapping
    public R<List<UserMessageDTO>> list(@RequestParam(required = false) Long memberId) {
        return R.ok(svc.list(memberId));
    }

    @PostMapping("/{id}/read")
    public R<UserMessageDTO> markRead(@PathVariable Long id) {
        return R.ok(svc.markRead(id));
    }

    @DeleteMapping("/{id}")
    public R<Void> hide(@PathVariable Long id) {
        svc.hide(id);
        return R.ok(null);
    }
}
