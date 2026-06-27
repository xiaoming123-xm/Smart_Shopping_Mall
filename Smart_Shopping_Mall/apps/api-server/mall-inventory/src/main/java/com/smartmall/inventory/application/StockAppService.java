package com.smartmall.inventory.application;
import com.smartmall.inventory.application.dto.StockDTO;
import com.smartmall.inventory.application.dto.StockRecordDTO;
import com.smartmall.inventory.domain.model.Stock;
import com.smartmall.inventory.domain.model.StockRecord;
import com.smartmall.inventory.domain.repository.StockRepository;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor public class StockAppService {
    private final StockRepository repo;
    public List<StockDTO> list(){ return repo.findAll().stream().map(this::toDTO).toList(); }
    public StockDTO getBySku(Long skuId){ return repo.findBySkuId(skuId).map(this::toDTO).orElseThrow(()->new BizException(ResultCode.STOCK_NOT_FOUND)); }

    /** 入库 */
    public StockDTO stockIn(Long skuId, Integer qty, String remark){
        Stock s=repo.findBySkuId(skuId).orElseGet(()->{ Stock n=new Stock(); n.setSkuId(skuId); n.setQuantity(0); return repo.save(n); });
        s.setQuantity(s.getQuantity()+qty); repo.save(s);
        record(skuId,"IN",qty,s.getQuantity(),remark);
        return toDTO(s);
    }
    /** 出库 */
    public StockDTO stockOut(Long skuId, Integer qty, String remark){
        Stock s=repo.findBySkuId(skuId).orElseThrow(()->new BizException(ResultCode.STOCK_NOT_FOUND));
        if(s.getQuantity()<qty) throw new BizException(ResultCode.STOCK_INSUFFICIENT);
        s.setQuantity(s.getQuantity()-qty); repo.save(s);
        record(skuId,"OUT",-qty,s.getQuantity(),remark);
        return toDTO(s);
    }
    public List<StockRecordDTO> records(Long skuId){ return repo.findRecordsBySkuId(skuId).stream().map(this::toRecDTO).toList(); }

    private void record(Long skuId,String type,int change,int after,String remark){
        StockRecord r=new StockRecord(); r.setSkuId(skuId); r.setType(type); r.setChange(change); r.setAfter(after); r.setRemark(remark);
        repo.addRecord(r);
    }
    private StockDTO toDTO(Stock s){ StockDTO d=new StockDTO(); d.setId(s.getId()); d.setSkuId(s.getSkuId()); d.setSkuCode(s.getSkuCode()); d.setQuantity(s.getQuantity()); d.setWarnThreshold(s.getWarnThreshold()); d.setCostPrice(s.getCostPrice()); d.setUpdatedAt(s.getUpdatedAt()); return d; }
    private StockRecordDTO toRecDTO(StockRecord r){ StockRecordDTO d=new StockRecordDTO(); d.setId(r.getId()); d.setSkuId(r.getSkuId()); d.setType(r.getType()); d.setChange(r.getChange()); d.setAfter(r.getAfter()); d.setRemark(r.getRemark()); d.setCreatedAt(r.getCreatedAt()); return d; }
}
