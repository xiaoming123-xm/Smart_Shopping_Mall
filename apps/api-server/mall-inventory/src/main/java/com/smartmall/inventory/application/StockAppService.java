package com.smartmall.inventory.application;

import com.smartmall.catalog.domain.model.Sku;
import com.smartmall.catalog.domain.model.Spu;
import com.smartmall.catalog.domain.repository.SpuRepository;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import com.smartmall.inventory.application.dto.StockDTO;
import com.smartmall.inventory.application.dto.StockRecordDTO;
import com.smartmall.inventory.domain.model.Stock;
import com.smartmall.inventory.domain.model.StockRecord;
import com.smartmall.inventory.domain.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StockAppService {
    private final StockRepository repo;
    private final SpuRepository spuRepo;

    public List<StockDTO> list() {
        ensureStocksForAllSkus();
        List<StockDTO> rows = new ArrayList<>();
        for (Stock stock : repo.findAll()) {
            Optional<Sku> sku = spuRepo.findSkuById(stock.getSkuId());
            if (sku.isPresent()) {
                Sku skuEntity = sku.get();
                boolean changed = false;
                if ((stock.getSkuCode() == null || stock.getSkuCode().isBlank()) && skuEntity.getSkuCode() != null) {
                    stock.setSkuCode(skuEntity.getSkuCode());
                    changed = true;
                }
                if (stock.getCostPrice() == null && skuEntity.getCostPrice() != null) {
                    stock.setCostPrice(skuEntity.getCostPrice());
                    changed = true;
                }
                if (changed) {
                    repo.save(stock);
                }
                rows.add(toDTO(stock));
            }
        }
        return rows;
    }

    public StockDTO getBySku(Long skuId) {
        ensureStockForSku(skuId);
        return repo.findBySkuId(skuId).map(this::toDTO).orElseThrow(() -> new BizException(ResultCode.STOCK_NOT_FOUND));
    }

    public StockDTO stockIn(Long skuId, Integer qty, String remark) {
        Stock stock = loadOrCreateStock(skuId);
        stock.setQuantity(stock.getQuantity() + qty);
        repo.save(stock);
        syncCatalogStock(skuId, stock.getQuantity());
        record(skuId, "IN", qty, stock.getQuantity(), remark);
        return toDTO(stock);
    }

    public StockDTO stockOut(Long skuId, Integer qty, String remark) {
        Stock stock = loadOrCreateStock(skuId);
        if (stock.getQuantity() < qty) {
            throw new BizException(ResultCode.STOCK_INSUFFICIENT);
        }
        stock.setQuantity(stock.getQuantity() - qty);
        repo.save(stock);
        syncCatalogStock(skuId, stock.getQuantity());
        record(skuId, "OUT", -qty, stock.getQuantity(), remark);
        return toDTO(stock);
    }

    public List<StockRecordDTO> records(Long skuId) {
        ensureStockForSku(skuId);
        return repo.findRecordsBySkuId(skuId).stream().map(this::toRecDTO).toList();
    }

    private void ensureStocksForAllSkus() {
        for (Spu spu : spuRepo.findAll()) {
            for (Sku sku : spuRepo.findSkusBySpuId(spu.getId())) {
                ensureStockForSkuEntity(sku);
            }
        }
    }

    private void ensureStockForSku(Long skuId) {
        spuRepo.findSkuById(skuId).ifPresent(this::ensureStockForSkuEntity);
    }

    private void ensureStockForSkuEntity(Sku sku) {
        repo.findBySkuId(sku.getId()).orElseGet(() -> {
            Stock stock = new Stock();
            stock.setSkuId(sku.getId());
            stock.setSkuCode(sku.getSkuCode());
            stock.setQuantity(sku.getStock() == null ? 0 : sku.getStock());
            stock.setWarnThreshold(10);
            stock.setCostPrice(sku.getCostPrice());
            return repo.save(stock);
        });
    }

    private Stock loadOrCreateStock(Long skuId) {
        ensureStockForSku(skuId);
        return repo.findBySkuId(skuId).orElseGet(() -> {
            Stock stock = new Stock();
            stock.setSkuId(skuId);
            stock.setQuantity(0);
            stock.setWarnThreshold(10);
            spuRepo.findSkuById(skuId).ifPresent(sku -> {
                stock.setSkuCode(sku.getSkuCode());
                stock.setCostPrice(sku.getCostPrice());
                stock.setQuantity(sku.getStock() == null ? 0 : sku.getStock());
            });
            return repo.save(stock);
        });
    }

    private void syncCatalogStock(Long skuId, Integer quantity) {
        spuRepo.findSkuById(skuId).ifPresent(sku -> {
            sku.setStock(quantity);
            spuRepo.saveSku(sku);
            spuRepo.findById(sku.getSpuId()).ifPresent(this::updateSpuStock);
        });
    }

    private void updateSpuStock(Spu spu) {
        int total = spuRepo.findSkusBySpuId(spu.getId()).stream()
                .map(Sku::getStock)
                .filter(value -> value != null)
                .mapToInt(Integer::intValue)
                .sum();
        spu.setStock(total);
        spuRepo.save(spu);
    }

    private void record(Long skuId, String type, int change, int after, String remark) {
        StockRecord record = new StockRecord();
        record.setSkuId(skuId);
        record.setType(type);
        record.setChange(change);
        record.setAfter(after);
        record.setRemark(remark);
        repo.addRecord(record);
    }

    private StockDTO toDTO(Stock stock) {
        StockDTO dto = new StockDTO();
        dto.setId(stock.getId());
        dto.setSkuId(stock.getSkuId());
        dto.setSkuCode(stock.getSkuCode());
        dto.setQuantity(stock.getQuantity());
        dto.setWarnThreshold(stock.getWarnThreshold());
        dto.setCostPrice(stock.getCostPrice());
        dto.setUpdatedAt(stock.getUpdatedAt());
        return dto;
    }

    private StockRecordDTO toRecDTO(StockRecord record) {
        StockRecordDTO dto = new StockRecordDTO();
        dto.setId(record.getId());
        dto.setSkuId(record.getSkuId());
        dto.setType(record.getType());
        dto.setChange(record.getChange());
        dto.setAfter(record.getAfter());
        dto.setRemark(record.getRemark());
        dto.setCreatedAt(record.getCreatedAt());
        return dto;
    }
}
