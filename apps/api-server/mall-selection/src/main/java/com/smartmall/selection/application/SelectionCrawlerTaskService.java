package com.smartmall.selection.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import com.smartmall.selection.application.command.StartSelectionCrawlerCommand;
import com.smartmall.selection.application.dto.CrawlerTaskDTO;
import com.smartmall.selection.infrastructure.persistence.SelectionDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SelectionCrawlerTaskService {
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };
    private static final int MAX_SAMPLE_LIMIT = 100;
    private static final int TOP_RESULT_LIMIT = 10;

    private final SelectionDataStore store;
    private final ObjectMapper objectMapper;
    private final PddCrawlerSessionService pddSessionService;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Value("${mall.selection.crawler.python:python}")
    private String pythonCommand;

    @Value("${mall.selection.crawler.script:tools/crawler/pdd_selection_spider.py}")
    private String crawlerScript;

    @Value("${mall.selection.crawler.limit:10}")
    private int crawlerLimit;

    @Value("${mall.selection.crawler.require-login:true}")
    private boolean requireLogin;

    @Value("${mall.selection.crawler.remote-debugging-port:9223}")
    private int remoteDebuggingPort;

    public CrawlerTaskDTO start(StartSelectionCrawlerCommand command, String triggerType, String createdBy) {
        Long categoryId = command == null ? null : command.getCategoryId();
        if (categoryId != null && store.findCategory(categoryId).isEmpty()) {
            throw new BizException(ResultCode.SELECTION_CATEGORY_NOT_FOUND);
        }
        if (store.hasRunningTask(categoryId)) {
            throw new BizException(ResultCode.CRAWLER_TASK_ALREADY_RUNNING);
        }

        CrawlerTaskDTO task = new CrawlerTaskDTO();
        task.setTaskId("sel-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        task.setPlatform("PDD");
        task.setCategoryId(categoryId);
        task.setKeyword(command == null ? null : command.getKeyword());
        task.setStatus("PENDING");
        task.setTriggerType(triggerType == null ? "MANUAL" : triggerType);
        task.setTotalCount(TOP_RESULT_LIMIT);
        task.setSuccessCount(0);
        task.setRetryCount(0);
        task.setAntiCrawlStatus("PENDING");
        task.setAnomalyCount(0);
        task.setBlockSignalCount(0);
        task.setBackoffCount(0);
        task.setCreatedBy(createdBy == null ? "admin" : createdBy);
        task.setCreatedAt(LocalDateTime.now());
        store.saveTask(task);

        executor.submit(() -> runTask(task.getTaskId()));
        return task;
    }

    public CrawlerTaskDTO status(String taskId) {
        return store.findTask(taskId).orElseThrow(() -> new BizException(ResultCode.CRAWLER_TASK_NOT_FOUND));
    }

    private void runTask(String taskId) {
        CrawlerTaskDTO task = store.getMutableTask(taskId);
        if (task == null) return;
        try {
            task.setStatus("RUNNING");
            task.setStartedAt(LocalDateTime.now());
            if (requireLogin && !pddSessionService.isReady()) {
                task.setStatus("NOT_LOGGED_IN");
                task.setFailReason("请先在选品中心完成拼多多登录。没有可验证的拼多多 Cookie 时不能启动抓取。");
                task.setAntiCrawlStatus("NOT_LOGGED_IN");
                task.setFinishedAt(LocalDateTime.now());
                store.saveTask(task);
                return;
            }

            CrawlerExecutionResult result = executeCrawler(task);
            int count = result.rows().isEmpty() ? 0 : store.replaceProductsFromCrawler(task.getCategoryId(), result.rows());
            task.setSuccessCount(count);
            task.setRetryCount(result.asInt("backoff_count"));
            task.setAntiCrawlStatus(result.asString("anti_crawl_status", "UNKNOWN"));
            task.setAnomalyCount(result.asInt("anomaly_count"));
            task.setBlockSignalCount(result.asInt("block_signal_count"));
            task.setBackoffCount(result.asInt("backoff_count"));
            task.setProxyEnabled(result.asBoolean("proxy_enabled"));
            task.setObservedUserAgent(result.asString("user_agent", ""));
            task.setAvgDelayMs(result.asDouble("avg_delay_ms"));
            task.setMaxDelayMs(result.asDouble("max_delay_ms"));
            task.setAntiCrawlEvidence(result.evidenceJson(objectMapper));
            if (count > 0) {
                task.setStatus(count < task.getTotalCount() ? "PARTIAL_SUCCESS" : "SUCCESS");
            } else if ("ABORTED_FOR_SAFETY".equals(task.getAntiCrawlStatus())) {
                task.setStatus("FAILED");
                task.setFailReason("抓取触发安全保护，已停止。不会继续重试或绕过验证。");
            } else if ("NO_REAL_DATA".equals(task.getAntiCrawlStatus())) {
                task.setStatus("NO_REAL_DATA");
                task.setFailReason("没有抓到带真实来源标识的商品，已停止；不会保存演示或编造数据。");
            } else if ("CHROME_DEBUG_NOT_OPEN".equals(task.getAntiCrawlStatus())) {
                task.setStatus("FAILED");
                task.setFailReason("拼多多专用浏览器没有用可读取模式打开。请关闭当前拼多多专用窗口，重新点击“登录拼多多”，完成登录确认后再抓取。");
            } else if ("LOGIN_EXPIRED".equals(task.getAntiCrawlStatus())) {
                task.setStatus("LOGIN_EXPIRED");
                task.setFailReason("拼多多登录会话已失效，请重新登录后再抓取。");
            } else {
                task.setStatus("NO_REAL_DATA");
                task.setFailReason("没有抓到真实商品数据。");
            }
            task.setFinishedAt(LocalDateTime.now());
            store.saveTask(task);
        } catch (Exception ex) {
            task.setStatus("FAILED");
            task.setFailReason(ex.getMessage());
            task.setFinishedAt(LocalDateTime.now());
            store.saveTask(task);
        }
    }

    private CrawlerExecutionResult executeCrawler(CrawlerTaskDTO task) throws IOException, InterruptedException {
        Path repoRoot = resolveRepoRoot();
        Path scriptPath = repoRoot.resolve(crawlerScript).normalize();
        if (!Files.exists(scriptPath)) {
            throw new IOException("Crawler script not found: " + scriptPath);
        }

        Path tempDir = Files.createTempDirectory("smartmall-crawler-");
        Path outputFile = tempDir.resolve(task.getTaskId() + ".jsonl");
        List<String> command = new ArrayList<>();
        command.add(pythonCommand);
        command.add(scriptPath.toString());
        command.add("--task-id");
        command.add(task.getTaskId());
        command.add("--category-id");
        List<Long> crawlerCategoryIds = store.resolveCategoryIds(task.getCategoryId());
        command.add(String.valueOf(crawlerCategoryIds.isEmpty() ? 101L : crawlerCategoryIds.get(0)));
        command.add("--keyword");
        command.add(task.getKeyword() == null || task.getKeyword().isBlank() ? "热销商品" : task.getKeyword());
        command.add("--limit");
        int sampleLimit = crawlerLimit <= 0 ? MAX_SAMPLE_LIMIT : crawlerLimit;
        command.add(String.valueOf(Math.max(TOP_RESULT_LIMIT, Math.min(sampleLimit, MAX_SAMPLE_LIMIT))));
        command.add("--output");
        command.add(outputFile.toString());
        command.add("--session-dir");
        command.add(pddSessionService.sessionPath().toString());
        command.add("--remote-debugging-port");
        command.add(String.valueOf(remoteDebuggingPort));
        if (requireLogin) command.add("--require-login");

        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(repoRoot.toFile());
        builder.redirectErrorStream(true);
        Process process = builder.start();
        String stdout = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new IOException("Crawler process failed: " + stdout.trim());
        }
        String summaryLine = stdout.lines().filter(line -> !line.isBlank()).reduce((first, second) -> second)
                .orElseThrow(() -> new IOException("Crawler process produced empty output."));
        Map<String, Object> summary = objectMapper.readValue(summaryLine, MAP_TYPE);
        List<Map<String, Object>> rows = Files.exists(outputFile)
                ? Files.readAllLines(outputFile).stream()
                .filter(line -> !line.isBlank())
                .map(this::readRow)
                .collect(Collectors.toList())
                : List.of();
        return new CrawlerExecutionResult(summary, rows);
    }

    private Map<String, Object> readRow(String line) {
        try {
            return objectMapper.readValue(line, MAP_TYPE);
        } catch (IOException ex) {
            throw new IllegalStateException("Invalid crawler row: " + ex.getMessage(), ex);
        }
    }

    private Path resolveRepoRoot() {
        Path current = Path.of("").toAbsolutePath().normalize();
        for (Path cursor = current; cursor != null; cursor = cursor.getParent()) {
            if (Files.exists(cursor.resolve("tools").resolve("crawler").resolve("pdd_selection_spider.py"))) {
                return cursor;
            }
        }
        return current;
    }

    private record CrawlerExecutionResult(Map<String, Object> summary, List<Map<String, Object>> rows) {
        private String asString(String key, String defaultValue) {
            Object value = summary.get(key);
            if (value == null) return defaultValue;
            String text = String.valueOf(value).trim();
            return text.isEmpty() ? defaultValue : text;
        }

        private Integer asInt(String key) {
            Object value = summary.get(key);
            if (value instanceof Number number) return number.intValue();
            return value == null ? 0 : Integer.parseInt(String.valueOf(value));
        }

        private Double asDouble(String key) {
            Object value = summary.get(key);
            if (value instanceof Number number) return number.doubleValue();
            return value == null ? 0D : Double.parseDouble(String.valueOf(value));
        }

        private Boolean asBoolean(String key) {
            Object value = summary.get(key);
            if (value instanceof Boolean bool) return bool;
            return value != null && Boolean.parseBoolean(String.valueOf(value));
        }

        private String evidenceJson(ObjectMapper objectMapper) throws IOException {
            return objectMapper.writeValueAsString(summary);
        }
    }
}
