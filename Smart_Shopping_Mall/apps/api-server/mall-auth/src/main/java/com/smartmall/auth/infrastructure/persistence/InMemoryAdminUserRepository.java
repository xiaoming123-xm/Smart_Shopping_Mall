package com.smartmall.auth.infrastructure.persistence;
import com.smartmall.auth.domain.model.AdminUser;
import com.smartmall.auth.domain.repository.AdminUserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
@Repository
public class InMemoryAdminUserRepository implements AdminUserRepository {
    private final Map<Long,AdminUser> store = new ConcurrentHashMap<>();
    private final AtomicLong idGen = new AtomicLong(0);

    @PostConstruct
    public void seed(){
        save(build("admin","123456","超级管理员"));
        save(build("operator","123456","运营员"));
    }
    private AdminUser build(String u,String p,String nick){
        AdminUser a=new AdminUser(); a.setUsername(u); a.setPasswordHash(p);
        a.setNickname(nick); a.setEnabled(true); a.setCreatedAt(LocalDateTime.now()); return a;
    }
    @Override public AdminUser save(AdminUser u){
        if(u.getId()==null) u.setId(idGen.incrementAndGet());
        store.put(u.getId(),u); return u;
    }
    @Override public Optional<AdminUser> findByUsername(String username){
        return store.values().stream().filter(u->u.getUsername().equals(username)).findFirst();
    }
    @Override public List<AdminUser> findAll(){ return new ArrayList<>(store.values()); }
    @Override public Optional<AdminUser> findById(Long id){ return Optional.ofNullable(store.get(id)); }
    @Override public void deleteById(Long id){ store.remove(id); }
}