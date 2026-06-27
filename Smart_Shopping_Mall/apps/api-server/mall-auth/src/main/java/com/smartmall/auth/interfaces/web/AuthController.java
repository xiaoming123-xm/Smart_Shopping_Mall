package com.smartmall.auth.interfaces.web;
import com.smartmall.auth.application.AuthAppService;
import com.smartmall.auth.application.command.LoginCommand;
import com.smartmall.auth.application.dto.CaptchaDTO;
import com.smartmall.auth.application.dto.LoginDTO;
import com.smartmall.common.api.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthAppService authAppService;
    @GetMapping("/captcha") public R<CaptchaDTO> captcha(){ return R.ok(authAppService.generateCaptcha()); }
    @PostMapping("/login") public R<LoginDTO> login(@Valid @RequestBody LoginCommand cmd){ return R.ok(authAppService.login(cmd)); }
    @PostMapping("/logout") public R<Void> logout(){ return R.ok(); }
}