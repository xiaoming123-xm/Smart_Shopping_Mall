package com.smartmall.catalog.infrastructure.persistence;
import com.smartmall.catalog.domain.model.Spu;
import com.smartmall.catalog.domain.model.Sku;
import com.smartmall.catalog.domain.repository.SpuRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
@Repository @Profile("!local") public class InMemorySpuRepository implements SpuRepository {
    private final Map<Long,Spu> spuStore=new ConcurrentHashMap<>();
    private final Map<Long,Sku> skuStore=new ConcurrentHashMap<>();
    private final AtomicLong spuIdGen=new AtomicLong(0);
    private final AtomicLong skuIdGen=new AtomicLong(0);

    @PostConstruct public void seed(){
        Spu s=new Spu();
        s.setName("纯棉基础款T恤"); s.setCategoryId(1L); s.setBrandId(2L);
        s.setMainImage("https://placehold.co/300x300?text=T-Shirt");
        s.setDescription("100%纯棉,多色可选"); s.setPrice(new BigDecimal("79.00"));
        s.setCostPrice(new BigDecimal("32.00")); s.setStock(200); s.setStatus(1); s.setSort(1);
        save(s);
        Sku k1=new Sku(); k1.setSpuId(s.getId()); k1.setSkuCode("TS-RED-XL"); k1.setSpecs("红色/XL");
        k1.setPrice(new BigDecimal("79.00")); k1.setCostPrice(new BigDecimal("32.00")); k1.setStock(100); k1.setStatus(1);
        saveSku(k1);
        Sku k2=new Sku(); k2.setSpuId(s.getId()); k2.setSkuCode("TS-BLK-L"); k2.setSpecs("黑色/L");
        k2.setPrice(new BigDecimal("79.00")); k2.setCostPrice(new BigDecimal("32.00")); k2.setStock(100); k2.setStatus(1);
        saveSku(k2);
    }

    @Override public Spu save(Spu s){ LocalDateTime now=LocalDateTime.now(); if(s.getId()==null){s.setId(spuIdGen.incrementAndGet());s.setCreatedAt(now);}s.setUpdatedAt(now);spuStore.put(s.getId(),s);return s; }
    @Override public Optional<Spu> findById(Long id){ return Optional.ofNullable(spuStore.get(id)); }
    @Override public List<Spu> findAll(){ return spuStore.values().stream().sorted(Comparator.comparing(Spu::getSort,Comparator.nullsLast(Comparator.naturalOrder()))).toList(); }
    @Override public List<Spu> findByCategoryIds(List<Long> categoryIds){ if(categoryIds==null||categoryIds.isEmpty()) return findAll(); return findAll().stream().filter(s->s.getCategoryId()!=null&&categoryIds.contains(s.getCategoryId())).toList(); }
    @Override public void deleteById(Long id){ spuStore.remove(id); }
    @Override public Sku saveSku(Sku sku){ if(sku.getId()==null) sku.setId(skuIdGen.incrementAndGet()); skuStore.put(sku.getId(),sku); return sku; }
    @Override public Optional<Sku> findSkuById(Long id){ return Optional.ofNullable(skuStore.get(id)); }
    @Override public List<Sku> findSkusBySpuId(Long spuId){ return skuStore.values().stream().filter(k->k.getSpuId().equals(spuId)).sorted(Comparator.comparing(Sku::getId)).toList(); }
    @Override public void deleteSku(Long id){ skuStore.remove(id); }
    @Override public void deleteSkusBySpuId(Long spuId){ skuStore.values().removeIf(k->k.getSpuId().equals(spuId)); }
}
