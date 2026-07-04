package com.smartmall.catalog.domain.repository;
import com.smartmall.catalog.domain.model.Brand;
import java.util.*;
public interface BrandRepository {
    Brand save(Brand b); Optional<Brand> findById(Long id); List<Brand> findAll();
    boolean existsByName(String name, Long excludeId); void deleteById(Long id);
}