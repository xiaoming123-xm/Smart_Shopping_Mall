package com.smartmall.catalog.application;
import com.smartmall.catalog.application.dto.AttributeDTO; import com.smartmall.catalog.domain.model.*;
import com.smartmall.catalog.domain.repository.AttributeRepository; import com.smartmall.catalog.domain.repository.CategoryRepository; import com.smartmall.common.api.ResultCode; import com.smartmall.common.exception.BizException;
import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.*;
@Service @RequiredArgsConstructor public class AttributeAppService {
    private final AttributeRepository repo; private final CategoryRepository categoryRepo;

    public List<AttributeDTO> list(){ return buildTree(repo.findAll()); }
    public AttributeDTO get(Long id){ return repo.findById(id).map(this::toDTO).orElseThrow(()->new BizException(ResultCode.ATTR_NOT_FOUND)); }

    @Transactional public AttributeDTO create(AttributeDTO r){
        Attribute saved=repo.save(fromReq(new Attribute(),r));
        replaceCategoryLinks(saved,r);
        return get(saved.getId());
    }

    @Transactional public AttributeDTO update(Long id,AttributeDTO r){
        Attribute a=repo.findById(id).orElseThrow(()->new BizException(ResultCode.ATTR_NOT_FOUND));
        if(r.getParentId()!=null && Objects.equals(r.getParentId(),id)) throw new BizException(ResultCode.PARAM_INVALID,"属性不能选择自己作为父级");
        Attribute saved=repo.save(fromReq(a,r));
        replaceCategoryLinks(saved,r);
        return get(saved.getId());
    }

    @Transactional public void delete(Long id){
        repo.findById(id).orElseThrow(()->new BizException(ResultCode.ATTR_NOT_FOUND));
        if(repo.existsByParentId(id)) throw new BizException(ResultCode.PARAM_INVALID,"该属性下面还有子属性，不能直接删除");
        if(repo.existsCategoryLinkByAttrId(id)) throw new BizException(ResultCode.PARAM_INVALID,"该属性已经绑定分类，请先取消分类绑定");
        repo.deleteById(id);
    }

    public AttributeValue addValue(Long attrId,String value,Integer sort){
        repo.findById(attrId).orElseThrow(()->new BizException(ResultCode.ATTR_NOT_FOUND));
        if(repo.existsByParentId(attrId)) throw new BizException(ResultCode.PARAM_INVALID,"父级属性只用于分组，不能添加属性值");
        AttributeValue v=new AttributeValue(); v.setAttrId(attrId); v.setValue(value); v.setSort(sort!=null?sort:0); return repo.saveValue(v);
    }
    public void deleteValue(Long valId){ repo.deleteValue(valId); }

    private Attribute fromReq(Attribute a,AttributeDTO r){
        if(r.getParentId()!=null){
            Long parentId=normalizeParentId(r.getParentId());
            if(parentId!=null && repo.findById(parentId).isEmpty()) throw new BizException(ResultCode.ATTR_GROUP_NOT_FOUND,"父级属性不存在");
            a.setParentId(parentId);
        } else if(a.getId()==null) a.setParentId(null);
        if(r.getName()!=null)a.setName(r.getName()); if(r.getType()!=null)a.setType(r.getType()); if(r.getSearchable()!=null)a.setSearchable(r.getSearchable()); if(r.getRequired()!=null)a.setRequired(r.getRequired()); if(r.getSort()!=null)a.setSort(r.getSort()); return a;
    }

    private void replaceCategoryLinks(Attribute a, AttributeDTO r){
        if(r.getCategoryIds()==null) return;
        List<Long> categoryIds=normalizeParentId(a.getParentId())==null ? List.of() : r.getCategoryIds().stream().filter(Objects::nonNull).distinct().toList();
        for(Long categoryId: categoryIds){ categoryRepo.findById(categoryId).orElseThrow(()->new BizException(ResultCode.CATEGORY_NOT_FOUND)); }
        repo.replaceCategoryLinks(a.getId(),categoryIds);
    }

    private List<AttributeDTO> buildTree(List<Attribute> attrs){
        Map<Long,AttributeDTO> nodes=new LinkedHashMap<>();
        for(Attribute a: attrs) nodes.put(a.getId(),toDTO(a));
        List<AttributeDTO> roots=new ArrayList<>();
        for(Attribute a: attrs){
            AttributeDTO node=nodes.get(a.getId()); Long parentId=normalizeParentId(a.getParentId());
            if(parentId==null){ roots.add(node); continue; }
            AttributeDTO parent=nodes.get(parentId);
            if(parent==null) roots.add(node); else parent.getChildren().add(node);
        }
        return roots;
    }

    private Long normalizeParentId(Long parentId){ return parentId==null || parentId==0L ? null : parentId; }
    private AttributeDTO toDTO(Attribute a){ AttributeDTO d=new AttributeDTO(); d.setId(a.getId()); d.setParentId(a.getParentId()); d.setName(a.getName()); d.setType(a.getType()); d.setSearchable(a.getSearchable()); d.setRequired(a.getRequired()); d.setSort(a.getSort()); d.setCreatedAt(a.getCreatedAt()); d.setValues(repo.findValuesByAttrId(a.getId())); d.setCategoryIds(repo.findCategoryIdsByAttrId(a.getId())); return d; }
}
