package com.smartmall.catalog.application;
import com.smartmall.catalog.application.dto.BrandDTO;
import com.smartmall.catalog.domain.model.Brand;
import com.smartmall.catalog.domain.repository.BrandRepository;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor public class BrandAppService {
    private final BrandRepository brandRepo;
    public List<BrandDTO> list(){ return brandRepo.findAll().stream().map(this::toDTO).toList(); }
    public BrandDTO get(Long id){ return brandRepo.findById(id).map(this::toDTO).orElseThrow(()->new BizException(ResultCode.BRAND_NOT_FOUND)); }
    public BrandDTO create(BrandDTO req){
        if(brandRepo.existsByName(req.getName(),null)) throw new BizException(ResultCode.BRAND_NAME_DUPLICATE);
        Brand b=new Brand(); b.setName(req.getName()); b.setLogo(req.getLogo()); b.setDescription(req.getDescription()); b.setEnabled(req.getEnabled()!=null?req.getEnabled():true); b.setSort(req.getSort()!=null?req.getSort():0);
        return toDTO(brandRepo.save(b));
    }
    public BrandDTO update(Long id, BrandDTO req){
        Brand b=brandRepo.findById(id).orElseThrow(()->new BizException(ResultCode.BRAND_NOT_FOUND));
        if(req.getName()!=null&&!req.getName().equals(b.getName())&&brandRepo.existsByName(req.getName(),id)) throw new BizException(ResultCode.BRAND_NAME_DUPLICATE);
        if(req.getName()!=null) b.setName(req.getName()); if(req.getLogo()!=null) b.setLogo(req.getLogo());
        if(req.getDescription()!=null) b.setDescription(req.getDescription()); if(req.getEnabled()!=null) b.setEnabled(req.getEnabled()); if(req.getSort()!=null) b.setSort(req.getSort());
        return toDTO(brandRepo.save(b));
    }
    public void delete(Long id){ brandRepo.findById(id).orElseThrow(()->new BizException(ResultCode.BRAND_NOT_FOUND)); brandRepo.deleteById(id); }
    private BrandDTO toDTO(Brand b){ BrandDTO d=new BrandDTO(); d.setId(b.getId()); d.setName(b.getName()); d.setLogo(b.getLogo()); d.setDescription(b.getDescription()); d.setEnabled(b.getEnabled()); d.setSort(b.getSort()); d.setCreatedAt(b.getCreatedAt()); return d; }
}