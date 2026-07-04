package com.smartmall.inventory.infrastructure.persistence;
import com.smartmall.inventory.domain.model.Stock;
import com.smartmall.inventory.domain.model.StockRecord;
import com.smartmall.inventory.domain.repository.StockRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
@Repository public class InMemoryStockRepository implements StockRepository {
    private final Map<Long,Stock> store=new ConcurrentHashMap<>();
    private final Map<Long,StockRecord> records=new ConcurrentHashMap<>();
    private final AtomicLong idGen=new AtomicLong(0);
    private final AtomicLong recIdGen=new AtomicLong(0);
    @PostConstruct public void seed(){
        save(mk(1L,"TS-RED-XL",100)); save(mk(2L,"TS-BLK-L",100));
    }
    private Stock mk(Long skuId,String code,int qty){
        Stock s=new Stock(); s.setSkuId(skuId); s.setSkuCode(code); s.setQuantity(qty);
        s.setWarnThreshold(10); s.setCostPrice(new BigDecimal("32.00")); return s;
    }
    @Override public Stock save(Stock s){ if(s.getId()==null) s.setId(idGen.incrementAndGet()); s.setUpdatedAt(LocalDateTime.now()); store.put(s.getId(),s); return s; }
    @Override public Optional<Stock> findById(Long id){ return Optional.ofNullable(store.get(id)); }
    @Override public Optional<Stock> findBySkuId(Long skuId){ return store.values().stream().filter(s->s.getSkuId().equals(skuId)).findFirst(); }
    @Override public List<Stock> findAll(){ return store.values().stream().sorted(Comparator.comparing(Stock::getId)).toList(); }
    @Override public StockRecord addRecord(StockRecord r){ r.setId(recIdGen.incrementAndGet()); r.setCreatedAt(LocalDateTime.now()); records.put(r.getId(),r); return r; }
    @Override public List<StockRecord> findRecordsBySkuId(Long skuId){ return records.values().stream().filter(r->r.getSkuId().equals(skuId)).sorted(Comparator.comparing(StockRecord::getId).reversed()).toList(); }
}
