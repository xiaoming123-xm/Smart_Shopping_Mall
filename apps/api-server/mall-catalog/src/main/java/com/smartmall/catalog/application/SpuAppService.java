package com.smartmall.catalog.application;

import com.smartmall.catalog.application.dto.SkuDTO;
import com.smartmall.catalog.application.dto.SpuDTO;
import com.smartmall.catalog.domain.model.Sku;
import com.smartmall.catalog.domain.model.Spu;
import com.smartmall.catalog.domain.repository.SpuRepository;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpuAppService {
    private final SpuRepository spuRepo;

    public List<SpuDTO> list() {
        return spuRepo.findAll().stream().peek(this::ensureDefaultSkuIfMissing).map(s -> toDTO(s, true)).toList();
    }

    public List<SpuDTO> listByCategoryIds(List<Long> categoryIds) {
        return spuRepo.findByCategoryIds(categoryIds).stream()
                .peek(this::ensureDefaultSkuIfMissing)
                .map(s -> toDTO(s, true))
                .toList();
    }

    public SpuDTO get(Long id) {
        Spu spu = spuRepo.findById(id).orElseThrow(() -> new BizException(ResultCode.SPU_NOT_FOUND));
        ensureDefaultSkuIfMissing(spu);
        return toDTO(spu, true);
    }

    public SpuDTO create(SpuDTO req) {
        Spu spu = new Spu();
        apply(spu, req);
        if (spu.getStatus() == null) {
            spu.setStatus(1);
        }
        if (spu.getSort() == null) {
            spu.setSort(0);
        }
        spuRepo.save(spu);
        if (req.getSkus() != null && !req.getSkus().isEmpty()) {
            for (SkuDTO skuDTO : req.getSkus()) {
                Sku sku = new Sku();
                sku.setSpuId(spu.getId());
                applySku(sku, skuDTO);
                if (sku.getStatus() == null) {
                    sku.setStatus(1);
                }
                spuRepo.saveSku(sku);
            }
        } else {
            createDefaultSku(spu);
        }
        return toDTO(spu, true);
    }

    public SpuDTO update(Long id, SpuDTO req) {
        Spu spu = spuRepo.findById(id).orElseThrow(() -> new BizException(ResultCode.SPU_NOT_FOUND));
        apply(spu, req);
        spuRepo.save(spu);
        ensureDefaultSkuIfMissing(spu);
        return toDTO(spu, true);
    }

    public void delete(Long id) {
        spuRepo.findById(id).orElseThrow(() -> new BizException(ResultCode.SPU_NOT_FOUND));
        spuRepo.deleteSkusBySpuId(id);
        spuRepo.deleteById(id);
    }

    public SpuDTO changeStatus(Long id, Integer status) {
        Spu spu = spuRepo.findById(id).orElseThrow(() -> new BizException(ResultCode.SPU_NOT_FOUND));
        spu.setStatus(status);
        spuRepo.save(spu);
        ensureDefaultSkuIfMissing(spu);
        return toDTO(spu, true);
    }

    public List<SkuDTO> listSkus(Long spuId) {
        Spu spu = spuRepo.findById(spuId).orElseThrow(() -> new BizException(ResultCode.SPU_NOT_FOUND));
        ensureDefaultSkuIfMissing(spu);
        return spuRepo.findSkusBySpuId(spuId).stream().map(this::toSkuDTO).toList();
    }

    public SkuDTO addSku(Long spuId, SkuDTO req) {
        Spu spu = spuRepo.findById(spuId).orElseThrow(() -> new BizException(ResultCode.SPU_NOT_FOUND));
        Sku sku = new Sku();
        sku.setSpuId(spuId);
        applySku(sku, req);
        if (sku.getStatus() == null) {
            sku.setStatus(1);
        }
        if (sku.getSkuCode() == null || sku.getSkuCode().isBlank()) {
            sku.setSkuCode(buildDefaultSkuCode(spu, null));
        }
        return toSkuDTO(spuRepo.saveSku(sku));
    }

    public SkuDTO updateSku(Long skuId, SkuDTO req) {
        Sku sku = spuRepo.findSkuById(skuId).orElseThrow(() -> new BizException(ResultCode.SKU_NOT_FOUND));
        applySku(sku, req);
        if (sku.getSkuCode() == null || sku.getSkuCode().isBlank()) {
            Spu spu = spuRepo.findById(sku.getSpuId()).orElse(null);
            sku.setSkuCode(buildDefaultSkuCode(spu, sku));
        }
        return toSkuDTO(spuRepo.saveSku(sku));
    }

    public void deleteSku(Long skuId) {
        Sku sku = spuRepo.findSkuById(skuId).orElseThrow(() -> new BizException(ResultCode.SKU_NOT_FOUND));
        spuRepo.deleteSku(skuId);
        spuRepo.findById(sku.getSpuId()).ifPresent(this::ensureDefaultSkuIfMissing);
    }

    private void ensureDefaultSkuIfMissing(Spu spu) {
        if (spuRepo.findSkusBySpuId(spu.getId()).isEmpty()) {
            createDefaultSku(spu);
        }
    }

    private void createDefaultSku(Spu spu) {
        Sku sku = new Sku();
        sku.setSpuId(spu.getId());
        sku.setSkuCode(buildDefaultSkuCode(spu, null));
        sku.setSpecs("默认款");
        sku.setPrice(spu.getPrice());
        sku.setCostPrice(spu.getCostPrice());
        sku.setStock(spu.getStock());
        sku.setStatus(spu.getStatus() == null ? 1 : spu.getStatus());
        spuRepo.saveSku(sku);
    }

    private String buildDefaultSkuCode(Spu spu, Sku sku) {
        Long spuId = sku != null && sku.getSpuId() != null ? sku.getSpuId() : (spu == null ? null : spu.getId());
        return "SKU-" + (spuId == null ? "AUTO" : spuId) + "-DEFAULT";
    }

    private void apply(Spu spu, SpuDTO req) {
        if (req.getName() != null) {
            spu.setName(req.getName());
        }
        if (req.getCategoryId() != null) {
            spu.setCategoryId(req.getCategoryId());
        }
        if (req.getBrandId() != null) {
            spu.setBrandId(req.getBrandId());
        }
        if (req.getMainImage() != null) {
            spu.setMainImage(req.getMainImage());
        }
        if (req.getDescription() != null) {
            spu.setDescription(req.getDescription());
        }
        if (req.getAttributesJson() != null) {
            spu.setAttributesJson(req.getAttributesJson());
        }
        if (req.getPrice() != null) {
            spu.setPrice(req.getPrice());
        }
        if (req.getCostPrice() != null) {
            spu.setCostPrice(req.getCostPrice());
        }
        if (req.getStock() != null) {
            spu.setStock(req.getStock());
        }
        if (req.getStatus() != null) {
            spu.setStatus(req.getStatus());
        }
        if (req.getSort() != null) {
            spu.setSort(req.getSort());
        }
    }

    private void applySku(Sku sku, SkuDTO req) {
        if (req.getSkuCode() != null) {
            sku.setSkuCode(req.getSkuCode());
        }
        if (req.getSpecs() != null) {
            sku.setSpecs(req.getSpecs());
        }
        if (req.getPrice() != null) {
            sku.setPrice(req.getPrice());
        }
        if (req.getCostPrice() != null) {
            sku.setCostPrice(req.getCostPrice());
        }
        if (req.getStock() != null) {
            sku.setStock(req.getStock());
        }
        if (req.getStatus() != null) {
            sku.setStatus(req.getStatus());
        }
    }

    private SpuDTO toDTO(Spu spu, boolean withSkus) {
        SpuDTO dto = new SpuDTO();
        dto.setId(spu.getId());
        dto.setName(spu.getName());
        dto.setCategoryId(spu.getCategoryId());
        dto.setBrandId(spu.getBrandId());
        dto.setMainImage(spu.getMainImage());
        dto.setDescription(spu.getDescription());
        dto.setAttributesJson(spu.getAttributesJson());
        dto.setPrice(spu.getPrice());
        dto.setCostPrice(spu.getCostPrice());
        dto.setStock(spu.getStock());
        dto.setStatus(spu.getStatus());
        dto.setSort(spu.getSort());
        dto.setCreatedAt(spu.getCreatedAt());
        if (withSkus) {
            dto.setSkus(spuRepo.findSkusBySpuId(spu.getId()).stream().map(this::toSkuDTO).toList());
        }
        return dto;
    }

    private SkuDTO toSkuDTO(Sku sku) {
        SkuDTO dto = new SkuDTO();
        dto.setId(sku.getId());
        dto.setSpuId(sku.getSpuId());
        dto.setSkuCode(sku.getSkuCode());
        dto.setSpecs(sku.getSpecs());
        dto.setPrice(sku.getPrice());
        dto.setCostPrice(sku.getCostPrice());
        dto.setStock(sku.getStock());
        dto.setStatus(sku.getStatus());
        return dto;
    }
}
