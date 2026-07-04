package com.smartmall.catalog.infrastructure.persistence;
import com.smartmall.catalog.domain.model.Brand;
import com.smartmall.catalog.domain.repository.BrandRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
@Repository @Profile("!mysql") public class InMemoryBrandRepository implements BrandRepository {
    private final Map<Long,Brand> store=new ConcurrentHashMap<>();
    private final AtomicLong idGen=new AtomicLong(0);
    @PostConstruct public void seed(){ save(mk("Apple","苹果",1)); save(mk("Xiaomi","小米",2)); save(mk("Huawei","华为",3)); }
    private Brand mk(String name,String desc,int sort){ Brand b=new Brand(); b.setName(name); b.setDescription(desc); b.setSort(sort); b.setEnabled(true); return b; }
    @Override public Brand save(Brand b){ LocalDateTime now=LocalDateTime.now(); if(b.getId()==null){b.setId(idGen.incrementAndGet());b.setCreatedAt(now);}b.setUpdatedAt(now);store.put(b.getId(),b);return b; }
    @Override public Optional<Brand> findById(Long id){ return Optional.ofNullable(store.get(id)); }
    @Override public List<Brand> findAll(){ return store.values().stream().sorted(Comparator.comparing(Brand::getSort,Comparator.nullsLast(Comparator.naturalOrder()))).toList(); }
    @Override public boolean existsByName(String name,Long excludeId){ return store.values().stream().anyMatch(b->b.getName().equals(name)&&(excludeId==null||!b.getId().equals(excludeId))); }
    @Override public void deleteById(Long id){ store.remove(id); }
}
