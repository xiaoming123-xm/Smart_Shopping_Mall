package com.smartmall.catalog.infrastructure.persistence;
import com.smartmall.catalog.domain.model.*; import com.smartmall.catalog.domain.repository.AttributeRepository;
import jakarta.annotation.PostConstruct; import org.springframework.stereotype.Repository;
import org.springframework.context.annotation.Profile;
import java.time.LocalDateTime; import java.util.*; import java.util.concurrent.*; import java.util.concurrent.atomic.AtomicLong;
@Repository @Profile("!mysql") public class InMemoryAttributeRepository implements AttributeRepository {
    private final Map<Long,Attribute> attrs=new ConcurrentHashMap<>();
    private final Map<Long,AttributeValue> vals=new ConcurrentHashMap<>();
    private final AtomicLong aid=new AtomicLong(0); private final AtomicLong vid=new AtomicLong(0);
    @PostConstruct public void seed(){
        Attribute c=new Attribute(); c.setName("颜色"); c.setType("SELECT"); c.setSearchable(true); c.setRequired(true); c.setSort(1); save(c);
        saveValue(mkv(c.getId(),"红色",1)); saveValue(mkv(c.getId(),"蓝色",2)); saveValue(mkv(c.getId(),"黑色",3));
        Attribute s=new Attribute(); s.setName("尺码"); s.setType("SELECT"); s.setSearchable(true); s.setRequired(true); s.setSort(2); save(s);
        saveValue(mkv(s.getId(),"S",1)); saveValue(mkv(s.getId(),"M",2)); saveValue(mkv(s.getId(),"L",3)); saveValue(mkv(s.getId(),"XL",4));
    }
    private AttributeValue mkv(Long attrId,String v,int sort){ AttributeValue av=new AttributeValue(); av.setAttrId(attrId); av.setValue(v); av.setSort(sort); return av; }
    @Override public Attribute save(Attribute a){ LocalDateTime now=LocalDateTime.now(); if(a.getId()==null){a.setId(aid.incrementAndGet());a.setCreatedAt(now);}a.setUpdatedAt(now);attrs.put(a.getId(),a);return a; }
    @Override public Optional<Attribute> findById(Long id){ return Optional.ofNullable(attrs.get(id)); }
    @Override public List<Attribute> findAll(){ return attrs.values().stream().sorted(Comparator.comparing(Attribute::getSort,Comparator.nullsLast(Comparator.naturalOrder()))).toList(); }
    @Override public void deleteById(Long id){ attrs.remove(id); vals.values().removeIf(v->v.getAttrId().equals(id)); }
    @Override public AttributeValue saveValue(AttributeValue v){ if(v.getId()==null) v.setId(vid.incrementAndGet()); vals.put(v.getId(),v); return v; }
    @Override public List<AttributeValue> findValuesByAttrId(Long attrId){ return vals.values().stream().filter(v->v.getAttrId().equals(attrId)).sorted(Comparator.comparing(AttributeValue::getSort,Comparator.nullsLast(Comparator.naturalOrder()))).toList(); }
    @Override public void deleteValue(Long id){ vals.remove(id); }
}
