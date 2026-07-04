package com.smartmall.system.infrastructure.persistence;
import com.smartmall.system.domain.model.SysUser;
import com.smartmall.system.domain.repository.SysUserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
@Repository public class InMemorySysUserRepository implements SysUserRepository {
    private final Map<Long,SysUser> store=new ConcurrentHashMap<>();
    private final AtomicLong idGen=new AtomicLong(0);
    @PostConstruct public void seed(){
        save(mk("admin","超级管理员","ADMIN")); save(mk("operator","运营专员","OPERATOR"));
    }
    private SysUser mk(String u,String nick,String role){ SysUser s=new SysUser(); s.setUsername(u); s.setNickname(nick); s.setRole(role); s.setEnabled(true); return s; }
    @Override public SysUser save(SysUser u){ if(u.getId()==null){u.setId(idGen.incrementAndGet());u.setCreatedAt(LocalDateTime.now());} store.put(u.getId(),u); return u; }
    @Override public Optional<SysUser> findById(Long id){ return Optional.ofNullable(store.get(id)); }
    @Override public List<SysUser> findAll(){ return store.values().stream().sorted(Comparator.comparing(SysUser::getId)).toList(); }
    @Override public boolean existsByUsername(String username,Long excludeId){ return store.values().stream().anyMatch(u->u.getUsername().equals(username)&&(excludeId==null||!u.getId().equals(excludeId))); }
    @Override public void deleteById(Long id){ store.remove(id); }
}
