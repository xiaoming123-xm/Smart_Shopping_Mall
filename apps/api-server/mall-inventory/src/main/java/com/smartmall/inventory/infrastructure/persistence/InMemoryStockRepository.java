package com.smartmall.inventory.infrastructure.persistence;

import com.smartmall.inventory.domain.model.Stock;
import com.smartmall.inventory.domain.model.StockRecord;
import com.smartmall.inventory.domain.repository.StockRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile("!local")
public class InMemoryStockRepository implements StockRepository {
    private final Map<Long, Stock> store = new ConcurrentHashMap<>();
    private final Map<Long, StockRecord> records = new ConcurrentHashMap<>();
    private final AtomicLong idGen = new AtomicLong(0);
    private final AtomicLong recIdGen = new AtomicLong(0);

    @PostConstruct
    public void seed() {
        save(mk(1L, "TS-RED-XL", 100));
        save(mk(2L, "TS-BLK-L", 100));
    }

    private Stock mk(Long skuId, String code, int qty) {
        Stock stock = new Stock();
        stock.setSkuId(skuId);
        stock.setSkuCode(code);
        stock.setQuantity(qty);
        stock.setWarnThreshold(10);
        stock.setCostPrice(new BigDecimal("32.00"));
        return stock;
    }

    @Override
    public Stock save(Stock stock) {
        if (stock.getId() == null) {
            stock.setId(idGen.incrementAndGet());
        }
        stock.setUpdatedAt(LocalDateTime.now());
        store.put(stock.getId(), stock);
        return stock;
    }

    @Override
    public Optional<Stock> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public Optional<Stock> findBySkuId(Long skuId) {
        return store.values().stream().filter(stock -> stock.getSkuId().equals(skuId)).findFirst();
    }

    @Override
    public List<Stock> findAll() {
        return store.values().stream().sorted(Comparator.comparing(Stock::getId)).toList();
    }

    @Override
    public StockRecord addRecord(StockRecord record) {
        record.setId(recIdGen.incrementAndGet());
        record.setCreatedAt(LocalDateTime.now());
        records.put(record.getId(), record);
        return record;
    }

    @Override
    public List<StockRecord> findRecordsBySkuId(Long skuId) {
        return records.values().stream()
                .filter(record -> record.getSkuId().equals(skuId))
                .sorted(Comparator.comparing(StockRecord::getId).reversed())
                .toList();
    }
}
