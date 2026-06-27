package com.smartmall.catalog.application;
import com.smartmall.catalog.application.dto.SpuDTO;
import com.smartmall.catalog.application.dto.SkuDTO;
import com.smartmall.catalog.domain.model.Spu;
import com.smartmall.catalog.domain.model.Sku;
import com.smartmall.catalog.domain.repository.SpuRepository;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor public class SpuAppService {
    private final SpuRepository spuRepo;

    public List<SpuDTO> list(){ return spuRepo.findAll().stream().map(s->toDTO(s,false)).toList(); }

    public SpuDTO get(Long id){
        Spu s=spuRepo.findById(id).orElseThrow(()->new BizException(ResultCode.SPU_NOT_FOUND));
        return toDTO(s,true);
    }

    public SpuDTO create(SpuDTO req){
        Spu s=new Spu();
        apply(s,req);
        if(s.getStatus()==null) s.setStatus(1);
        if(s.getSort()==null) s.setSort(0);
        spuRepo.save(s);
        if(req.getSkus()!=null){ for(SkuDTO kd: req.getSkus()){ Sku k=new Sku(); k.setSpuId(s.getId()); applySku(k,kd); spuRepo.saveSku(k); } }
        return toDTO(s,true);
    }

    public SpuDTO update(Long id, SpuDTO req){
        Spu s=spuRepo.findById(id).orElseThrow(()->new BizException(ResultCode.SPU_NOT_FOUND));
        apply(s,req);
        spuRepo.save(s);
        return toDTO(s,true);
    }

    public void delete(Long id){
        spuRepo.findById(id).orElseThrow(()->new BizException(ResultCode.SPU_NOT_FOUND));
        spuRepo.deleteSkusBySpuId(id);
        spuRepo.deleteById(id);
    }

    /** 上下架: status 0=下架 1=上架 */
    public SpuDTO changeStatus(Long id, Integer status){
        Spu s=spuRepo.findById(id).orElseThrow(()->new BizException(ResultCode.SPU_NOT_FOUND));
        s.setStatus(status); spuRepo.save(s);
        return toDTO(s,true);
    }

    // ---- SKU 管理 ----
    public List<SkuDTO> listSkus(Long spuId){
        spuRepo.findById(spuId).orElseThrow(()->new BizException(ResultCode.SPU_NOT_FOUND));
        return spuRepo.findSkusBySpuId(spuId).stream().map(this::toSkuDTO).toList();
    }
    public SkuDTO addSku(Long spuId, SkuDTO req){
        spuRepo.findById(spuId).orElseThrow(()->new BizException(ResultCode.SPU_NOT_FOUND));
        Sku k=new Sku(); k.setSpuId(spuId); applySku(k,req); if(k.getStatus()==null) k.setStatus(1);
        return toSkuDTO(spuRepo.saveSku(k));
    }
    public SkuDTO updateSku(Long skuId, SkuDTO req){
        Sku k=spuRepo.findSkuById(skuId).orElseThrow(()->new BizException(ResultCode.SKU_NOT_FOUND));
        applySku(k,req); return toSkuDTO(spuRepo.saveSku(k));
    }
    public void deleteSku(Long skuId){
        spuRepo.findSkuById(skuId).orElseThrow(()->new BizException(ResultCode.SKU_NOT_FOUND));
        spuRepo.deleteSku(skuId);
    }

    private void apply(Spu s, SpuDTO r){
        if(r.getName()!=null) s.setName(r.getName());
        if(r.getCategoryId()!=null) s.setCategoryId(r.getCategoryId());
        if(r.getBrandId()!=null) s.setBrandId(r.getBrandId());
        if(r.getMainImage()!=null) s.setMainImage(r.getMainImage());
        if(r.getDescription()!=null) s.setDescription(r.getDescription());
        if(r.getPrice()!=null) s.setPrice(r.getPrice());
        if(r.getCostPrice()!=null) s.setCostPrice(r.getCostPrice());
        if(r.getStock()!=null) s.setStock(r.getStock());
        if(r.getStatus()!=null) s.setStatus(r.getStatus());
        if(r.getSort()!=null) s.setSort(r.getSort());
    }
    private void applySku(Sku k, SkuDTO r){
        if(r.getSkuCode()!=null) k.setSkuCode(r.getSkuCode());
        if(r.getSpecs()!=null) k.setSpecs(r.getSpecs());
        if(r.getPrice()!=null) k.setPrice(r.getPrice());
        if(r.getCostPrice()!=null) k.setCostPrice(r.getCostPrice());
        if(r.getStock()!=null) k.setStock(r.getStock());
        if(r.getStatus()!=null) k.setStatus(r.getStatus());
    }
    private SpuDTO toDTO(Spu s, boolean withSkus){
        SpuDTO d=new SpuDTO();
        d.setId(s.getId()); d.setName(s.getName()); d.setCategoryId(s.getCategoryId()); d.setBrandId(s.getBrandId());
        d.setMainImage(s.getMainImage()); d.setDescription(s.getDescription()); d.setPrice(s.getPrice());
        d.setCostPrice(s.getCostPrice()); d.setStock(s.getStock()); d.setStatus(s.getStatus()); d.setSort(s.getSort());
        d.setCreatedAt(s.getCreatedAt());
        if(withSkus) d.setSkus(spuRepo.findSkusBySpuId(s.getId()).stream().map(this::toSkuDTO).toList());
        return d;
    }
    private SkuDTO toSkuDTO(Sku k){
        SkuDTO d=new SkuDTO();
        d.setId(k.getId()); d.setSpuId(k.getSpuId()); d.setSkuCode(k.getSkuCode()); d.setSpecs(k.getSpecs());
        d.setPrice(k.getPrice()); d.setCostPrice(k.getCostPrice()); d.setStock(k.getStock()); d.setStatus(k.getStatus());
        return d;
    }
}
