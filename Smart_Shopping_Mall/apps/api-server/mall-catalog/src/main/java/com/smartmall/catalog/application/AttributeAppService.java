package com.smartmall.catalog.application;
import com.smartmall.catalog.application.dto.AttributeDTO; import com.smartmall.catalog.domain.model.*;
import com.smartmall.catalog.domain.repository.AttributeRepository; import com.smartmall.common.api.ResultCode; import com.smartmall.common.exception.BizException;
import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import java.util.List;
@Service @RequiredArgsConstructor public class AttributeAppService {
    private final AttributeRepository repo;
    public List<AttributeDTO> list(){ return repo.findAll().stream().map(this::toDTO).toList(); }
    public AttributeDTO get(Long id){ return repo.findById(id).map(this::toDTO).orElseThrow(()->new BizException(ResultCode.ATTR_NOT_FOUND)); }
    public AttributeDTO create(AttributeDTO r){ return toDTO(repo.save(fromReq(new Attribute(),r))); }
    public AttributeDTO update(Long id,AttributeDTO r){ Attribute a=repo.findById(id).orElseThrow(()->new BizException(ResultCode.ATTR_NOT_FOUND)); return toDTO(repo.save(fromReq(a,r))); }
    public void delete(Long id){ repo.findById(id).orElseThrow(()->new BizException(ResultCode.ATTR_NOT_FOUND)); repo.deleteById(id); }
    public AttributeValue addValue(Long attrId,String value,Integer sort){ repo.findById(attrId).orElseThrow(()->new BizException(ResultCode.ATTR_NOT_FOUND)); AttributeValue v=new AttributeValue(); v.setAttrId(attrId); v.setValue(value); v.setSort(sort!=null?sort:0); return repo.saveValue(v); }
    public void deleteValue(Long valId){ repo.deleteValue(valId); }
    private Attribute fromReq(Attribute a,AttributeDTO r){ if(r.getName()!=null)a.setName(r.getName()); if(r.getType()!=null)a.setType(r.getType()); if(r.getSearchable()!=null)a.setSearchable(r.getSearchable()); if(r.getRequired()!=null)a.setRequired(r.getRequired()); if(r.getSort()!=null)a.setSort(r.getSort()); return a; }
    private AttributeDTO toDTO(Attribute a){ AttributeDTO d=new AttributeDTO(); d.setId(a.getId()); d.setName(a.getName()); d.setType(a.getType()); d.setSearchable(a.getSearchable()); d.setRequired(a.getRequired()); d.setSort(a.getSort()); d.setCreatedAt(a.getCreatedAt()); d.setValues(repo.findValuesByAttrId(a.getId())); return d; }
}