package com.smartmall.catalog.domain.repository;
import com.smartmall.catalog.domain.model.Spu;
import com.smartmall.catalog.domain.model.Sku;
import java.util.*;
public interface SpuRepository {
    Spu save(Spu s);
    Optional<Spu> findById(Long id);
    List<Spu> findAll();
    List<Spu> findByCategoryIds(List<Long> categoryIds);
    void deleteById(Long id);
    Sku saveSku(Sku sku);
    Optional<Sku> findSkuById(Long id);
    List<Sku> findSkusBySpuId(Long spuId);
    void deleteSku(Long id);
    void deleteSkusBySpuId(Long spuId);
}
