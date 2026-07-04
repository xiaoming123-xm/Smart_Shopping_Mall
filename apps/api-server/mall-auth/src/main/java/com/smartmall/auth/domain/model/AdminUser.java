package com.smartmall.auth.domain.model;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class AdminUser {
    private Long id;
    private String username;
    private String passwordHash; // BCrypt or plain for demo
    private String nickname;
    private Boolean enabled;
    private LocalDateTime createdAt;
}