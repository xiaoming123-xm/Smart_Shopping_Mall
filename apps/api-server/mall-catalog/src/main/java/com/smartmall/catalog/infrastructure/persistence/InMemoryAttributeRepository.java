package com.smartmall.catalog.infrastructure.persistence;
import com.smartmall.catalog.domain.model.*; import com.smartmall.catalog.domain.repository.AttributeRepository;
import jakarta.annotation.PostConstruct; import org.springframework.stereotype.Repository;
import org.springframework.context.annotation.Profile;
import java.time.LocalDateTime; import java.util.*; import java.util.concurrent.*; import java.util.concurrent.atomic.AtomicLong;
@Repository @Profile("!local") public class InMemoryAttributeRepository implements AttributeRepository {
    private final Map<Long,Attribute> attrs=new ConcurrentHashMap<>();
    private final Map<Long,AttributeValue> vals=new ConcurrentHashMap<>();
    private final Map<Long,Set<Long>> categoryLinks=new ConcurrentHashMap<>();
    private final AtomicLong aid=new AtomicLong(0); private final AtomicLong vid=new AtomicLong(0);
    @PostConstruct public void seed(){
        Attribute color=new Attribute(); color.setName("颜色"); color.setType("SELECT"); color.setSearchable(true); color.setRequired(true); color.setSort(1); save(color);
        saveValue(mkv(color.getId(),"红色",1)); saveValue(mkv(color.getId(),"蓝色",2)); saveValue(mkv(color.getId(),"黑色",3)); saveValue(mkv(color.getId(),"白色",4));
        Attribute size=new Attribute(); size.setName("尺码"); size.setType("GROUP"); size.setSearchable(false); size.setRequired(false); size.setSort(2); save(size);
        Attribute clothes=new Attribute(); clothes.setParentId(size.getId()); clothes.setName("衣服尺码"); clothes.setType("SELECT"); clothes.setSearchable(true); clothes.setRequired(true); clothes.setSort(1); save(clothes);
        for(String v: List.of("XS","S","M","L","XL","XXL")) saveValue(mkv(clothes.getId(),v,findValuesByAttrId(clothes.getId()).size()+1));
        Attribute shoes=new Attribute(); shoes.setParentId(size.getId()); shoes.setName("鞋子尺码"); shoes.setType("SELECT"); shoes.setSearchable(true); shoes.setRequired(true); shoes.setSort(2); save(shoes);
        for(String v: List.of("35","36","37","38","39","40","41","42","43","44")) saveValue(mkv(shoes.getId(),v,findValuesByAttrId(shoes.getId()).size()+1));
    }
    private AttributeValue mkv(Long attrId,String v,int sort){ AttributeValue av=new AttributeValue(); av.setAttrId(attrId); av.setValue(v); av.setSort(sort); return av; }
    @Override public Attribute save(Attribute a){ LocalDateTime now=LocalDateTime.now(); if(a.getId()==null){a.setId(aid.incrementAndGet());a.setCreatedAt(now);}a.setUpdatedAt(now);attrs.put(a.getId(),a);return a; }
    @Override public Optional<Attribute> findById(Long id){ return Optional.ofNullable(attrs.get(id)); }
    @Override public List<Attribute> findAll(){ return attrs.values().stream().sorted(Comparator.comparing((Attribute a)->a.getParentId()==null?0L:a.getParentId()).thenComparing(Attribute::getSort,Comparator.nullsLast(Comparator.naturalOrder())).thenComparing(Attribute::getId)).toList(); }
    @Override public void deleteById(Long id){ attrs.remove(id); vals.values().removeIf(v->v.getAttrId().equals(id)); categoryLinks.remove(id); }
    @Override public AttributeValue saveValue(AttributeValue v){ if(v.getId()==null) v.setId(vid.incrementAndGet()); vals.put(v.getId(),v); return v; }
    @Override public List<AttributeValue> findValuesByAttrId(Long attrId){ return vals.values().stream().filter(v->v.getAttrId().equals(attrId)).sorted(Comparator.comparing(AttributeValue::getSort,Comparator.nullsLast(Comparator.naturalOrder())).thenComparing(AttributeValue::getId)).toList(); }
    @Override public void deleteValue(Long id){ vals.remove(id); }
    @Override public boolean existsByParentId(Long parentId){ return attrs.values().stream().anyMatch(a->parentId.equals(a.getParentId())); }
    @Override public boolean existsCategoryLinkByAttrId(Long attrId){ return categoryLinks.containsKey(attrId)&&!categoryLinks.get(attrId).isEmpty(); }
    @Override public List<Long> findCategoryIdsByAttrId(Long attrId){ return categoryLinks.getOrDefault(attrId,Set.of()).stream().sorted().toList(); }
    @Override public void replaceCategoryLinks(Long attrId,List<Long> categoryIds){ categoryLinks.put(attrId,new LinkedHashSet<>(categoryIds)); }
}
