package com.smartmall.auth.application.command;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data public class LoginCommand {
    @NotBlank private String username;
    @NotBlank private String password;
    @NotBlank private String captchaKey;
    @NotBlank private String captchaCode;
}