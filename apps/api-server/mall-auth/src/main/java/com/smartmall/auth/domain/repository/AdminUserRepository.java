package com.smartmall.auth.domain.repository;
import com.smartmall.auth.domain.model.AdminUser;
import java.util.*;
public interface AdminUserRepository {
    AdminUser save(AdminUser u);
    Optional<AdminUser> findByUsername(String username);
    List<AdminUser> findAll();
    Optional<AdminUser> findById(Long id);
    void deleteById(Long id);
}