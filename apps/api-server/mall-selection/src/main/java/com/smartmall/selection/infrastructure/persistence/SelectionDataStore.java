package com.smartmall.selection.infrastructure.persistence;

import com.smartmall.selection.application.dto.CrawlerTaskDTO;
import com.smartmall.selection.application.dto.SelectionCategoryDTO;
import com.smartmall.selection.application.dto.SelectionProductDTO;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class SelectionDataStore {
    private final Map<Long, SelectionCategoryDTO> categories = new ConcurrentHashMap<>();
    private final Map<Long, SelectionProductDTO> products = new ConcurrentHashMap<>();
    private final Map<String, CrawlerTaskDTO> tasks = new ConcurrentHashMap<>();
    private final AtomicLong productIdGen = new AtomicLong(1000);

    @PostConstruct
    public void seed() {
        addCategory(1L, null, "食品饮料", "食品 饮料", 1, 1);
        addCategory(2L, null, "日用百货", "日用 百货", 1, 2);
        addCategory(3L, null, "服饰鞋包", "服饰 鞋包", 1, 3);
        addCategory(4L, null, "数码家电", "数码 家电", 1, 4);
        addCategory(5L, null, "母婴用品", "母婴 用品", 1, 5);
        addCategory(6L, null, "美妆个护", "美妆 个护", 1, 6);

        addCategory(101L, 1L, "休闲零食", "零食", 2, 1);
        addCategory(102L, 1L, "冲调饮品", "饮品", 2, 2);
        addCategory(201L, 2L, "清洁纸品", "纸巾 清洁", 2, 1);
        addCategory(202L, 2L, "收纳整理", "收纳", 2, 2);
        addCategory(301L, 3L, "女装上新", "女装", 2, 1);
        addCategory(302L, 3L, "运动鞋包", "运动鞋", 2, 2);
        addCategory(401L, 4L, "手机配件", "手机配件", 2, 1);
        addCategory(402L, 4L, "小家电", "小家电", 2, 2);
        addCategory(501L, 5L, "婴童洗护", "婴童洗护", 2, 1);
        addCategory(502L, 5L, "玩具早教", "玩具", 2, 2);
        addCategory(601L, 6L, "护肤套装", "护肤", 2, 1);
        addCategory(602L, 6L, "彩妆香氛", "彩妆", 2, 2);

        categories.values().stream()
                .filter(c -> c.getLevel() == 2)
                .forEach(c -> refreshProducts(c.getId(), c.getKeyword(), "seed"));
    }

    public List<SelectionCategoryDTO> categoryTree() {
        List<SelectionCategoryDTO> roots = categories.values().stream()
                .filter(c -> c.getParentId() == null)
                .sorted(Comparator.comparing(SelectionCategoryDTO::getSortOrder))
                .map(this::copyCategory)
                .toList();
        roots.forEach(root -> root.setChildren(categories.values().stream()
                .filter(c -> root.getId().equals(c.getParentId()))
                .sorted(Comparator.comparing(SelectionCategoryDTO::getSortOrder))
                .map(this::copyCategory)
                .toList()));
        return roots;
    }

    public Optional<SelectionCategoryDTO> findCategory(Long id) {
        return Optional.ofNullable(categories.get(id)).map(this::copyCategory);
    }

    public List<Long> resolveCategoryIds(Long categoryId) {
        if (categoryId == null) {
            return categories.values().stream().filter(c -> c.getLevel() == 2).map(SelectionCategoryDTO::getId).toList();
        }
        SelectionCategoryDTO c = categories.get(categoryId);
        if (c == null) {
            return List.of();
        }
        if (c.getLevel() == 1) {
            return categories.values().stream()
                    .filter(child -> categoryId.equals(child.getParentId()))
                    .map(SelectionCategoryDTO::getId)
                    .toList();
        }
        return List.of(categoryId);
    }

    public List<SelectionProductDTO> listProducts(Long categoryId, String sort, String order) {
        List<Long> ids = resolveCategoryIds(categoryId);
        Comparator<SelectionProductDTO> comparator = switch (sort == null ? "sales" : sort) {
            case "profit" -> Comparator.comparing(SelectionProductDTO::getProfitEstimate);
            case "fetched_time" -> Comparator.comparing(SelectionProductDTO::getFetchedAt);
            default -> Comparator.comparing(SelectionProductDTO::getSales7d);
        };
        if (!"asc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        return products.values().stream()
                .filter(p -> ids.isEmpty() || ids.contains(p.getCategoryId()))
                .sorted(comparator.thenComparing(SelectionProductDTO::getRankNo))
                .map(this::copyProduct)
                .toList();
    }

    public int refreshProducts(Long categoryId, String keyword, String taskId) {
        List<Long> ids = resolveCategoryIds(categoryId);
        int total = 0;
        for (Long id : ids) {
            products.values().removeIf(p -> id.equals(p.getCategoryId()));
            String categoryKeyword = keyword != null && !keyword.isBlank() ? keyword : categories.get(id).getKeyword();
            for (int i = 1; i <= 12; i++) {
                SelectionProductDTO product = makeProduct(id, categoryKeyword, i, taskId);
                products.put(product.getId(), product);
                total++;
            }
        }
        return total;
    }

    public boolean hasRunningTask(Long categoryId) {
        return tasks.values().stream().anyMatch(t ->
                "RUNNING".equals(t.getStatus()) &&
                        (categoryId == null || categoryId.equals(t.getCategoryId())));
    }

    public void saveTask(CrawlerTaskDTO task) {
        tasks.put(task.getTaskId(), task);
    }

    public Optional<CrawlerTaskDTO> findTask(String taskId) {
        return Optional.ofNullable(tasks.get(taskId)).map(this::copyTask);
    }

    public CrawlerTaskDTO getMutableTask(String taskId) {
        return tasks.get(taskId);
    }

    private void addCategory(Long id, Long parentId, String name, String keyword, int level, int sort) {
        SelectionCategoryDTO c = new SelectionCategoryDTO();
        c.setId(id);
        c.setParentId(parentId);
        c.setCategoryName(name);
        c.setKeyword(keyword);
        c.setLevel(level);
        c.setSortOrder(sort);
        c.setEnabled(true);
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());
        categories.put(id, c);
    }

    private SelectionProductDTO makeProduct(Long categoryId, String keyword, int rank, String taskId) {
        String[] tags = {"销量飙升", "新晋爆款", "高利润", "稳定热销"};
        String[] levels = {"低", "中", "高"};
        BigDecimal price = BigDecimal.valueOf(19 + rank * 3L + categoryId % 7).setScale(2, RoundingMode.HALF_UP);
        SelectionProductDTO p = new SelectionProductDTO();
        p.setId(productIdGen.incrementAndGet());
        p.setCategoryId(categoryId);
        p.setPlatform("PDD");
        p.setSourceProductId((taskId == null ? "seed" : taskId) + "-" + categoryId + "-" + rank);
        p.setProductName(keyword.replace(" ", "") + "热销款 " + rank);
        p.setImageUrl("https://placehold.co/360x360?text=" + keyword.replace(" ", "+") + "+" + rank);
        p.setSourceUrl("https://mobile.yangkeduo.com/search_result.html?search_key=" + keyword.replace(" ", "%20"));
        p.setSales7d(9800 - rank * 430 + (int) (categoryId % 10) * 80);
        p.setAvgPrice(price);
        p.setProfitEstimate(price.multiply(BigDecimal.valueOf(rank % 3 + 2)).divide(BigDecimal.valueOf(10), 2, RoundingMode.HALF_UP));
        p.setTrendTag(tags[(rank - 1) % tags.length]);
        p.setCompetitionLevel(levels[(rank + categoryId.intValue()) % levels.length]);
        p.setRankNo(rank);
        p.setFetchedAt(LocalDateTime.now());
        return p;
    }

    private SelectionCategoryDTO copyCategory(SelectionCategoryDTO c) {
        SelectionCategoryDTO x = new SelectionCategoryDTO();
        x.setId(c.getId());
        x.setParentId(c.getParentId());
        x.setCategoryName(c.getCategoryName());
        x.setKeyword(c.getKeyword());
        x.setLevel(c.getLevel());
        x.setSortOrder(c.getSortOrder());
        x.setEnabled(c.getEnabled());
        x.setCreatedAt(c.getCreatedAt());
        x.setUpdatedAt(c.getUpdatedAt());
        x.setChildren(new ArrayList<>());
        return x;
    }

    private SelectionProductDTO copyProduct(SelectionProductDTO p) {
        SelectionProductDTO x = new SelectionProductDTO();
        x.setId(p.getId());
        x.setCategoryId(p.getCategoryId());
        x.setPlatform(p.getPlatform());
        x.setSourceProductId(p.getSourceProductId());
        x.setProductName(p.getProductName());
        x.setImageUrl(p.getImageUrl());
        x.setSourceUrl(p.getSourceUrl());
        x.setSales7d(p.getSales7d());
        x.setAvgPrice(p.getAvgPrice());
        x.setProfitEstimate(p.getProfitEstimate());
        x.setTrendTag(p.getTrendTag());
        x.setCompetitionLevel(p.getCompetitionLevel());
        x.setRankNo(p.getRankNo());
        x.setFetchedAt(p.getFetchedAt());
        return x;
    }

    private CrawlerTaskDTO copyTask(CrawlerTaskDTO t) {
        CrawlerTaskDTO x = new CrawlerTaskDTO();
        x.setTaskId(t.getTaskId());
        x.setPlatform(t.getPlatform());
        x.setCategoryId(t.getCategoryId());
        x.setKeyword(t.getKeyword());
        x.setStatus(t.getStatus());
        x.setTriggerType(t.getTriggerType());
        x.setStartedAt(t.getStartedAt());
        x.setFinishedAt(t.getFinishedAt());
        x.setTotalCount(t.getTotalCount());
        x.setSuccessCount(t.getSuccessCount());
        x.setFailReason(t.getFailReason());
        x.setRetryCount(t.getRetryCount());
        x.setCreatedBy(t.getCreatedBy());
        x.setCreatedAt(t.getCreatedAt());
        return x;
    }
}
