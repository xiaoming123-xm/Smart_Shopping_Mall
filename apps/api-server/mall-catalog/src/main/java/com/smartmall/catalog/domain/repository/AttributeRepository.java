package com.smartmall.catalog.domain.repository;
import com.smartmall.catalog.domain.model.*;
import java.util.*;
public interface AttributeRepository {
    Attribute save(Attribute a); Optional<Attribute> findById(Long id); List<Attribute> findAll(); void deleteById(Long id);
    AttributeValue saveValue(AttributeValue v); List<AttributeValue> findValuesByAttrId(Long attrId); void deleteValue(Long id);
    boolean existsByParentId(Long parentId); boolean existsCategoryLinkByAttrId(Long attrId);
    List<Long> findCategoryIdsByAttrId(Long attrId); void replaceCategoryLinks(Long attrId, List<Long> categoryIds);
}
