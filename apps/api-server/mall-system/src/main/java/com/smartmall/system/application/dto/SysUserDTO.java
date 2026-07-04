package com.smartmall.system.application.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data public class SysUserDTO {
    private Long id; private String username; private String nickname; private String role; private Boolean enabled; private LocalDateTime createdAt;
}
