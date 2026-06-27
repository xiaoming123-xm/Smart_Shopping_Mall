package com.smartmall.system.domain.model;
import lombok.Data;
import java.time.LocalDateTime;
@Data public class SysUser {
    private Long id;
    private String username;
    private String nickname;
    private String role;       // ADMIN / OPERATOR
    private Boolean enabled;
    private LocalDateTime createdAt;
}
