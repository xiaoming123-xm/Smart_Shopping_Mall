package com.smartmall.selection.infrastructure.persistence;

import com.smartmall.selection.application.dto.CrawlerTaskDTO;
import com.smartmall.selection.application.dto.SelectionCategoryDTO;
import com.smartmall.selection.application.dto.SelectionProductDTO;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile("!local")
class InMemorySelectionDataStore extends SelectionDataStore {
    private final Map<Long, SelectionCategoryDTO> categories = new ConcurrentHashMap<>();
    private final Map<Long, SelectionProductDTO> products = new ConcurrentHashMap<>();
    private final Map<String, CrawlerTaskDTO> tasks = new ConcurrentHashMap<>();
    private final AtomicLong productIdGen = new AtomicLong(1000);

    @PostConstruct
    public void seed() {
        seedCategory(1L, null, "食品饮料", "食品 饮料", 1, 1);
        seedCategory(2L, null, "日用百货", "日用 百货", 1, 2);
        seedCategory(3L, null, "服饰鞋包", "服饰 鞋包", 1, 3);
        seedCategory(4L, null, "数码家电", "数码 家电", 1, 4);
        seedCategory(5L, null, "母婴用品", "母婴 用品", 1, 5);
        seedCategory(6L, null, "美妆个护", "美妆 个护", 1, 6);
        seedCategory(101L, 1L, "休闲零食", "零食", 2, 1);
        seedCategory(102L, 1L, "冲调饮品", "饮品", 2, 2);
        seedCategory(201L, 2L, "清洁纸品", "纸巾 清洁", 2, 1);
        seedCategory(202L, 2L, "灭蚊驱虫", "蚊子 灭蚊 驱蚊 蚊香 花露水 电蚊拍", 2, 2);
        seedCategory(301L, 3L, "衬衫", "衬衫", 2, 1);
        seedCategory(302L, 3L, "羽绒服", "羽绒服", 2, 2);
        seedCategory(401L, 4L, "手机配件", "手机配件", 2, 1);
        seedCategory(402L, 4L, "小家电", "小家电", 2, 2);
        seedCategory(501L, 5L, "婴童洗护", "婴童洗护", 2, 1);
        seedCategory(502L, 5L, "玩具早教", "玩具", 2, 2);
        seedCategory(601L, 6L, "护肤套装", "护肤", 2, 1);
        seedCategory(602L, 6L, "彩妆香氛", "彩妆", 2, 2);
    }

    @Override
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

    @Override
    public Optional<SelectionCategoryDTO> findCategory(Long id) {
        return Optional.ofNullable(categories.get(id)).map(this::copyCategory);
    }

    @Override
    public List<Long> resolveCategoryIds(Long categoryId) {
        if (categoryId == null) {
            return categories.values().stream().filter(c -> c.getLevel() == 2).map(SelectionCategoryDTO::getId).toList();
        }
        SelectionCategoryDTO c = categories.get(categoryId);
        if (c == null) return List.of();
        if (c.getLevel() == 1) {
            return categories.values().stream().filter(child -> categoryId.equals(child.getParentId())).map(SelectionCategoryDTO::getId).toList();
        }
        return List.of(categoryId);
    }

    @Override
    public List<SelectionProductDTO> listProducts(Long categoryId, String sort, String order) {
        List<Long> ids = resolveCategoryIds(categoryId);
        Comparator<SelectionProductDTO> comparator = comparator(sort);
        if (!"asc".equalsIgnoreCase(order)) comparator = comparator.reversed();
        return products.values().stream()
                .filter(p -> ids.isEmpty() || ids.contains(p.getCategoryId()))
                .filter(this::isRealProduct)
                .sorted(comparator.thenComparing(SelectionProductDTO::getRankNo, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::copyProduct)
                .toList();
    }

    @Override
    public int refreshProducts(Long categoryId, String keyword, String taskId) {
        List<Long> ids = resolveCategoryIds(categoryId);
        ids.forEach(id -> products.values().removeIf(p -> id.equals(p.getCategoryId())));
        return 0;
    }

    @Override
    public int replaceProductsFromCrawler(Long categoryId, List<Map<String, Object>> rows) {
        List<Long> ids = resolveCategoryIds(categoryId);
        ids.forEach(id -> products.values().removeIf(p -> id.equals(p.getCategoryId())));
        int total = 0;
        for (Map<String, Object> row : rows) {
            SelectionProductDTO product = mapCrawlerRow(row);
            if (!ids.isEmpty() && (product.getCategoryId() == null || !ids.contains(product.getCategoryId()))) {
                product.setCategoryId(ids.get(0));
            }
            if (!isRealProduct(product)) {
                continue;
            }
            products.put(product.getId(), product);
            total++;
        }
        return total;
    }

    @Override
    public boolean hasRunningTask(Long categoryId) {
        return tasks.values().stream().anyMatch(t -> ("PENDING".equals(t.getStatus()) || "RUNNING".equals(t.getStatus())) && (categoryId == null || categoryId.equals(t.getCategoryId())));
    }

    @Override
    public void saveTask(CrawlerTaskDTO task) { tasks.put(task.getTaskId(), task); }

    @Override
    public Optional<CrawlerTaskDTO> findTask(String taskId) { return Optional.ofNullable(tasks.get(taskId)).map(this::copyTask); }

    @Override
    public CrawlerTaskDTO getMutableTask(String taskId) { return tasks.get(taskId); }

    private void seedCategory(Long id, Long parentId, String name, String keyword, int level, int sort) {
        SelectionCategoryDTO c = new SelectionCategoryDTO();
        c.setId(id); c.setParentId(parentId); c.setCategoryName(name); c.setKeyword(keyword); c.setLevel(level); c.setSortOrder(sort); c.setEnabled(true); c.setCreatedAt(LocalDateTime.now()); c.setUpdatedAt(LocalDateTime.now());
        categories.put(id, c);
    }

    private SelectionProductDTO mapCrawlerRow(Map<String, Object> row) {
        SelectionProductDTO product = new SelectionProductDTO();
        product.setId(productIdGen.incrementAndGet());
        fillProductFromMap(product, row);
        return product;
    }
}

@Repository
@Profile("local")
class JdbcSelectionDataStore extends SelectionDataStore {
    private final JdbcTemplate jdbc;
    private final Map<String, CrawlerTaskDTO> runningTasks = new ConcurrentHashMap<>();

    private final RowMapper<SelectionCategoryDTO> categoryMapper = (rs, rowNum) -> {
        SelectionCategoryDTO c = new SelectionCategoryDTO();
        c.setId(rs.getLong("id"));
        c.setParentId((Long) rs.getObject("parent_id"));
        c.setCategoryName(rs.getString("category_name"));
        c.setKeyword(rs.getString("keyword"));
        c.setLevel(rs.getInt("level"));
        c.setSortOrder(rs.getInt("sort_order"));
        c.setEnabled(rs.getBoolean("enabled"));
        c.setCreatedAt(toLocalDateTime(rs.getTimestamp("created_at")));
        c.setUpdatedAt(toLocalDateTime(rs.getTimestamp("updated_at")));
        c.setChildren(new ArrayList<>());
        return c;
    };

    private final RowMapper<SelectionProductDTO> productMapper = (rs, rowNum) -> {
        SelectionProductDTO p = new SelectionProductDTO();
        p.setId(rs.getLong("id"));
        p.setCategoryId(rs.getLong("category_id"));
        p.setPlatform(rs.getString("platform"));
        p.setSourceProductId(rs.getString("source_product_id"));
        p.setProductName(rs.getString("product_name"));
        p.setImageUrl(rs.getString("image_url"));
        p.setSourceUrl(rs.getString("source_url"));
        p.setSales7d(rs.getInt("sales_7d"));
        p.setAvgPrice(rs.getBigDecimal("avg_price"));
        p.setSalesAmount(rs.getBigDecimal("sales_amount"));
        p.setProfitEstimate(rs.getBigDecimal("profit_estimate"));
        p.setTrendTag(rs.getString("trend_tag"));
        p.setCompetitionLevel(rs.getString("competition_level"));
        p.setRankNo(rs.getInt("rank_no"));
        p.setFetchedAt(toLocalDateTime(rs.getTimestamp("fetched_at")));
        return p;
    };

    private final RowMapper<CrawlerTaskDTO> taskMapper = (rs, rowNum) -> {
        CrawlerTaskDTO t = new CrawlerTaskDTO();
        t.setTaskId(rs.getString("task_id"));
        t.setPlatform(rs.getString("platform"));
        t.setCategoryId((Long) rs.getObject("category_id"));
        t.setKeyword(rs.getString("keyword"));
        t.setStatus(rs.getString("status"));
        t.setTriggerType(rs.getString("trigger_type"));
        t.setStartedAt(toLocalDateTime(rs.getTimestamp("started_at")));
        t.setFinishedAt(toLocalDateTime(rs.getTimestamp("finished_at")));
        t.setTotalCount(rs.getInt("total_count"));
        t.setSuccessCount(rs.getInt("success_count"));
        t.setFailReason(rs.getString("fail_reason"));
        t.setRetryCount(rs.getInt("retry_count"));
        t.setAntiCrawlStatus(rs.getString("anti_crawl_status"));
        t.setAnomalyCount(rs.getInt("anomaly_count"));
        t.setBlockSignalCount(rs.getInt("block_signal_count"));
        t.setBackoffCount(rs.getInt("backoff_count"));
        t.setProxyEnabled((Boolean) rs.getObject("proxy_enabled"));
        t.setObservedUserAgent(rs.getString("observed_user_agent"));
        BigDecimal avgDelay = rs.getBigDecimal("avg_delay_ms");
        BigDecimal maxDelay = rs.getBigDecimal("max_delay_ms");
        t.setAvgDelayMs(avgDelay == null ? null : avgDelay.doubleValue());
        t.setMaxDelayMs(maxDelay == null ? null : maxDelay.doubleValue());
        t.setAntiCrawlEvidence(rs.getString("anti_crawl_evidence"));
        t.setCreatedBy(rs.getString("created_by"));
        t.setCreatedAt(toLocalDateTime(rs.getTimestamp("created_at")));
        return t;
    };

    JdbcSelectionDataStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<SelectionCategoryDTO> categoryTree() {
        List<SelectionCategoryDTO> all = jdbc.query("SELECT * FROM selection_category WHERE enabled=1 ORDER BY sort_order ASC, id ASC", categoryMapper);
        List<SelectionCategoryDTO> roots = all.stream().filter(c -> c.getParentId() == null).map(this::copyCategory).toList();
        roots.forEach(root -> root.setChildren(all.stream()
                .filter(c -> root.getId().equals(c.getParentId()))
                .sorted(Comparator.comparing(SelectionCategoryDTO::getSortOrder))
                .map(this::copyCategory)
                .toList()));
        return roots;
    }

    @Override
    public Optional<SelectionCategoryDTO> findCategory(Long id) {
        return jdbc.query("SELECT * FROM selection_category WHERE id=?", categoryMapper, id).stream().findFirst();
    }

    @Override
    public List<Long> resolveCategoryIds(Long categoryId) {
        if (categoryId == null) {
            return jdbc.queryForList("SELECT id FROM selection_category WHERE level=2 AND enabled=1", Long.class);
        }
        Optional<SelectionCategoryDTO> category = findCategory(categoryId);
        if (category.isEmpty()) return List.of();
        if (category.get().getLevel() == 1) {
            return jdbc.queryForList("SELECT id FROM selection_category WHERE parent_id=? AND enabled=1", Long.class, categoryId);
        }
        return List.of(categoryId);
    }

    @Override
    public List<SelectionProductDTO> listProducts(Long categoryId, String sort, String order) {
        List<Long> ids = resolveCategoryIds(categoryId);
        if (ids.isEmpty()) return List.of();
        String orderBy = switch (sort == null ? "sales" : sort) {
            case "amount" -> "sales_amount";
            case "fetched_time" -> "fetched_at";
            default -> "sales_7d";
        };
        String direction = "asc".equalsIgnoreCase(order) ? "ASC" : "DESC";
        String placeholders = String.join(",", ids.stream().map(id -> "?").toList());
        String sql = "SELECT * FROM selection_product WHERE category_id IN (" + placeholders + ") "
                + "AND COALESCE(source_product_id, '') NOT LIKE 'seed%' "
                + "AND COALESCE(image_url, '') NOT LIKE '%placehold.co%' "
                + "AND product_name NOT LIKE '%热销款%' "
                + "AND product_name NOT LIKE '%鐑%' "
                + "ORDER BY " + orderBy + " " + direction + ", rank_no ASC";
        return jdbc.query(sql, productMapper, ids.toArray()).stream().filter(this::isRealProduct).toList();
    }

    @Override
    public int refreshProducts(Long categoryId, String keyword, String taskId) {
        List<Long> ids = resolveCategoryIds(categoryId);
        ids.forEach(id -> jdbc.update("DELETE FROM selection_product WHERE category_id=?", id));
        return 0;
    }

    @Override
    public int replaceProductsFromCrawler(Long categoryId, List<Map<String, Object>> rows) {
        List<Long> ids = resolveCategoryIds(categoryId);
        ids.forEach(id -> jdbc.update("DELETE FROM selection_product WHERE category_id=?", id));
        int total = 0;
        for (Map<String, Object> row : rows) {
            SelectionProductDTO product = new SelectionProductDTO();
            fillProductFromMap(product, row);
            if (!ids.isEmpty() && (product.getCategoryId() == null || !ids.contains(product.getCategoryId()))) {
                product.setCategoryId(ids.get(0));
            }
            if (!isRealProduct(product)) {
                continue;
            }
            BigDecimal price = defaultDecimal(product.getAvgPrice());
            BigDecimal amount = product.getSalesAmount() == null
                    ? price.multiply(BigDecimal.valueOf(product.getSales7d() == null ? 0 : product.getSales7d())).setScale(2, RoundingMode.HALF_UP)
                    : product.getSalesAmount();
            jdbc.update("""
                    INSERT INTO selection_product(category_id, platform, source_product_id, product_name, image_url, source_url,
                        sales_7d, avg_price, sales_amount, profit_estimate, trend_tag, competition_level, rank_no, fetched_at, task_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    product.getCategoryId(), product.getPlatform(), product.getSourceProductId(), product.getProductName(), product.getImageUrl(), product.getSourceUrl(),
                    product.getSales7d(), price, amount, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), product.getTrendTag(), product.getCompetitionLevel(), product.getRankNo(),
                    Timestamp.valueOf(product.getFetchedAt() == null ? LocalDateTime.now() : product.getFetchedAt()), asString(row.get("task_id"), null));
            total++;
        }
        return total;
    }

    @Override
    public boolean hasRunningTask(Long categoryId) {
        Integer dbCount = jdbc.queryForObject("""
                SELECT COUNT(*) FROM selection_crawler_task
                WHERE status IN ('PENDING','RUNNING') AND (? IS NULL OR category_id = ?)
                """, Integer.class, categoryId, categoryId);
        return (dbCount != null && dbCount > 0) || runningTasks.values().stream().anyMatch(t ->
                ("PENDING".equals(t.getStatus()) || "RUNNING".equals(t.getStatus())) && (categoryId == null || categoryId.equals(t.getCategoryId())));
    }

    @Override
    public void saveTask(CrawlerTaskDTO task) {
        runningTasks.put(task.getTaskId(), task);
        jdbc.update("""
                INSERT INTO selection_crawler_task(task_id, platform, category_id, keyword, status, trigger_type, started_at, finished_at,
                    total_count, success_count, fail_reason, retry_count, anti_crawl_status, anomaly_count, block_signal_count,
                    backoff_count, proxy_enabled, observed_user_agent, avg_delay_ms, max_delay_ms, anti_crawl_evidence, created_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE platform=VALUES(platform), category_id=VALUES(category_id), keyword=VALUES(keyword), status=VALUES(status),
                    trigger_type=VALUES(trigger_type), started_at=VALUES(started_at), finished_at=VALUES(finished_at), total_count=VALUES(total_count),
                    success_count=VALUES(success_count), fail_reason=VALUES(fail_reason), retry_count=VALUES(retry_count), anti_crawl_status=VALUES(anti_crawl_status),
                    anomaly_count=VALUES(anomaly_count), block_signal_count=VALUES(block_signal_count), backoff_count=VALUES(backoff_count),
                    proxy_enabled=VALUES(proxy_enabled), observed_user_agent=VALUES(observed_user_agent), avg_delay_ms=VALUES(avg_delay_ms),
                    max_delay_ms=VALUES(max_delay_ms), anti_crawl_evidence=VALUES(anti_crawl_evidence), created_by=VALUES(created_by)
                """,
                task.getTaskId(), task.getPlatform(), task.getCategoryId(), task.getKeyword(), task.getStatus(), task.getTriggerType(), toTimestamp(task.getStartedAt()), toTimestamp(task.getFinishedAt()),
                value(task.getTotalCount()), value(task.getSuccessCount()), task.getFailReason(), value(task.getRetryCount()), task.getAntiCrawlStatus(), value(task.getAnomalyCount()), value(task.getBlockSignalCount()),
                value(task.getBackoffCount()), task.getProxyEnabled(), task.getObservedUserAgent(), task.getAvgDelayMs(), task.getMaxDelayMs(), task.getAntiCrawlEvidence(), task.getCreatedBy(), toTimestamp(task.getCreatedAt()));
    }

    @Override
    public Optional<CrawlerTaskDTO> findTask(String taskId) {
        CrawlerTaskDTO running = runningTasks.get(taskId);
        if (running != null) {
            saveTask(running);
            if (isTerminalStatus(running.getStatus())) {
                runningTasks.remove(taskId);
            }
            return Optional.of(copyTask(running));
        }
        return jdbc.query("SELECT * FROM selection_crawler_task WHERE task_id=?", taskMapper, taskId).stream().findFirst();
    }

    @Override
    public CrawlerTaskDTO getMutableTask(String taskId) {
        return runningTasks.computeIfAbsent(taskId, id -> findTask(id).orElse(null));
    }
}

public abstract class SelectionDataStore {
    public abstract List<SelectionCategoryDTO> categoryTree();
    public abstract Optional<SelectionCategoryDTO> findCategory(Long id);
    public abstract List<Long> resolveCategoryIds(Long categoryId);
    public abstract List<SelectionProductDTO> listProducts(Long categoryId, String sort, String order);
    public abstract int refreshProducts(Long categoryId, String keyword, String taskId);
    public abstract int replaceProductsFromCrawler(Long categoryId, List<Map<String, Object>> rows);
    public abstract boolean hasRunningTask(Long categoryId);
    public abstract void saveTask(CrawlerTaskDTO task);
    public abstract Optional<CrawlerTaskDTO> findTask(String taskId);
    public abstract CrawlerTaskDTO getMutableTask(String taskId);

    protected Comparator<SelectionProductDTO> comparator(String sort) {
        return switch (sort == null ? "sales" : sort) {
            case "amount" -> Comparator.comparing(SelectionProductDTO::getSalesAmount, Comparator.nullsLast(Comparator.naturalOrder()));
            case "fetched_time" -> Comparator.comparing(SelectionProductDTO::getFetchedAt, Comparator.nullsLast(Comparator.naturalOrder()));
            default -> Comparator.comparing(SelectionProductDTO::getSales7d, Comparator.nullsLast(Comparator.naturalOrder()));
        };
    }

    protected boolean isTerminalStatus(String status) {
        return "SUCCESS".equals(status) || "FAILED".equals(status) || "NO_REAL_DATA".equals(status) || "LOGIN_EXPIRED".equals(status) || "NOT_LOGGED_IN".equals(status) || "PARTIAL_SUCCESS".equals(status);
    }

    protected boolean isRealProduct(SelectionProductDTO product) {
        if (product == null) return false;
        String name = product.getProductName() == null ? "" : product.getProductName().trim();
        String sourceId = product.getSourceProductId() == null ? "" : product.getSourceProductId().trim();
        String image = product.getImageUrl() == null ? "" : product.getImageUrl().trim();
        String sourceUrl = product.getSourceUrl() == null ? "" : product.getSourceUrl().trim();
        if (name.isBlank() || image.isBlank() || (sourceId.isBlank() && sourceUrl.isBlank())) return false;
        String lower = (name + " " + image + " " + sourceId).toLowerCase();
        return !lower.contains("热销款") && !lower.contains("placehold.co") && !lower.startsWith("seed") && !lower.contains("鐑");
    }

    protected SelectionCategoryDTO copyCategory(SelectionCategoryDTO c) {
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

    protected SelectionProductDTO copyProduct(SelectionProductDTO p) {
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
        x.setSalesAmount(p.getSalesAmount());
        x.setProfitEstimate(p.getProfitEstimate());
        x.setTrendTag(p.getTrendTag());
        x.setCompetitionLevel(p.getCompetitionLevel());
        x.setRankNo(p.getRankNo());
        x.setFetchedAt(p.getFetchedAt());
        return x;
    }

    protected CrawlerTaskDTO copyTask(CrawlerTaskDTO t) {
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
        x.setAntiCrawlStatus(t.getAntiCrawlStatus());
        x.setAnomalyCount(t.getAnomalyCount());
        x.setBlockSignalCount(t.getBlockSignalCount());
        x.setBackoffCount(t.getBackoffCount());
        x.setProxyEnabled(t.getProxyEnabled());
        x.setObservedUserAgent(t.getObservedUserAgent());
        x.setAvgDelayMs(t.getAvgDelayMs());
        x.setMaxDelayMs(t.getMaxDelayMs());
        x.setAntiCrawlEvidence(t.getAntiCrawlEvidence());
        x.setCreatedBy(t.getCreatedBy());
        x.setCreatedAt(t.getCreatedAt());
        return x;
    }

    protected void fillProductFromMap(SelectionProductDTO product, Map<String, Object> row) {
        product.setCategoryId(asLong(row.get("category_id")));
        product.setPlatform(asString(row.get("platform"), "PDD"));
        product.setSourceProductId(asString(row.get("source_product_id"), ""));
        product.setProductName(asString(row.get("product_name"), ""));
        product.setImageUrl(asString(row.get("image_url"), ""));
        product.setSourceUrl(asString(row.get("source_url"), ""));
        product.setSales7d(asInt(row.get("sales_7d")));
        product.setAvgPrice(asBigDecimal(row.get("avg_price")));
        product.setSalesAmount(asBigDecimal(row.get("sales_amount")));
        if (product.getSalesAmount().compareTo(BigDecimal.ZERO) == 0) {
            product.setSalesAmount(product.getAvgPrice().multiply(BigDecimal.valueOf(product.getSales7d())).setScale(2, RoundingMode.HALF_UP));
        }
        product.setProfitEstimate(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        product.setTrendTag(asString(row.get("trend_tag"), "真实抓取"));
        product.setCompetitionLevel(asString(row.get("competition_level"), ""));
        product.setRankNo(asInt(row.get("rank_no")));
        product.setFetchedAt(LocalDateTime.now());
    }

    protected static Long asLong(Object value) {
        if (value instanceof Number number) return number.longValue();
        return value == null ? null : Long.parseLong(String.valueOf(value));
    }

    protected static Integer asInt(Object value) {
        if (value instanceof Number number) return number.intValue();
        return value == null ? 0 : Integer.parseInt(String.valueOf(value));
    }

    protected static BigDecimal asBigDecimal(Object value) {
        if (value instanceof BigDecimal bigDecimal) return bigDecimal;
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue()).setScale(2, RoundingMode.HALF_UP);
        return value == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : new BigDecimal(String.valueOf(value)).setScale(2, RoundingMode.HALF_UP);
    }

    protected static BigDecimal defaultDecimal(BigDecimal value) {
        return value == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : value;
    }

    protected static String asString(Object value, String defaultValue) {
        if (value == null) return defaultValue;
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? defaultValue : text;
    }

    protected static LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    protected static Timestamp toTimestamp(LocalDateTime time) {
        return time == null ? null : Timestamp.valueOf(time);
    }

    protected static int value(Integer value) {
        return value == null ? 0 : value;
    }
}
