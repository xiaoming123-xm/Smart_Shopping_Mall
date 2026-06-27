package com.smartmall.system.domain.repository;
import com.smartmall.system.domain.model.SysUser;
import java.util.*;
public interface SysUserRepository {
    SysUser save(SysUser u);
    Optional<SysUser> findById(Long id);
    List<SysUser> findAll();
    boolean existsByUsername(String username, Long excludeId);
    void deleteById(Long id);
}
