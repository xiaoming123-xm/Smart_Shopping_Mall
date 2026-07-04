package com.smartmall.inventory.domain.repository;
import com.smartmall.inventory.domain.model.Stock;
import com.smartmall.inventory.domain.model.StockRecord;
import java.util.*;
public interface StockRepository {
    Stock save(Stock s);
    Optional<Stock> findById(Long id);
    Optional<Stock> findBySkuId(Long skuId);
    List<Stock> findAll();
    StockRecord addRecord(StockRecord r);
    List<StockRecord> findRecordsBySkuId(Long skuId);
}
