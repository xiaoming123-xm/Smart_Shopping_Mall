package com.smartmall.selection.application;

import com.smartmall.selection.application.dto.PddCrawlerSessionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class PddCrawlerSessionService {
    private static final String DEFAULT_LOGIN_URL = "https://mobile.yangkeduo.com/";

    @Value("${mall.selection.crawler.session-dir:work/crawler/pdd-browser-profile}")
    private String sessionDir;

    @Value("${mall.selection.crawler.login-url:https://mobile.yangkeduo.com/}")
    private String loginUrl;

    @Value("${mall.selection.crawler.chrome-command:}")
    private String chromeCommand;

    @Value("${mall.selection.crawler.remote-debugging-port:9223}")
    private int remoteDebuggingPort;

    private volatile boolean loginWindowOpened = false;

    public PddCrawlerSessionDTO status() {
        Path marker = confirmedMarkerPath();
        boolean profileExists = Files.exists(sessionPath());
        boolean sessionEvidence = profileExists && hasBrowserSessionEvidence();
        boolean ready = Files.exists(marker) && sessionEvidence;
        LocalDateTime confirmedAt = ready ? readConfirmedAt(marker) : null;
        String message;
        if (ready) {
            message = "拼多多登录会话已确认，可以启动小批量抓取。";
        } else if (profileExists || loginWindowOpened) {
            message = "已打开拼多多登录窗口；请在窗口里完成登录后点击“我已完成登录”。";
        } else {
            message = "请先点击“登录拼多多”打开专用登录窗口。";
        }
        return new PddCrawlerSessionDTO(ready, profileExists, loginWindowOpened, confirmedAt, loginUrl(), message);
    }

    public PddCrawlerSessionDTO openLoginWindow() throws IOException {
        Path profile = sessionPath();
        Files.createDirectories(profile);
        ProcessBuilder builder = new ProcessBuilder(resolveChromeCommand(),
                "--user-data-dir=" + profile,
                "--profile-directory=SmartMallPdd",
                "--remote-debugging-port=" + remoteDebuggingPort,
                "--remote-allow-origins=*",
                "--no-first-run",
                "--new-window",
                loginUrl());
        builder.start();
        loginWindowOpened = true;
        return status();
    }

    public PddCrawlerSessionDTO confirmLoggedIn(String username) throws IOException {
        Path profile = sessionPath();
        Files.createDirectories(profile);
        if (!hasBrowserSessionEvidence()) {
            deleteMarkerIfExists();
            return status();
        }
        LocalDateTime now = LocalDateTime.now();
        String marker = "confirmedAt=" + now + System.lineSeparator()
                + "confirmedBy=" + (username == null || username.isBlank() ? "admin" : username) + System.lineSeparator();
        Files.writeString(confirmedMarkerPath(), marker, StandardCharsets.UTF_8);
        return status();
    }

    public PddCrawlerSessionDTO clear() throws IOException {
        deleteMarkerIfExists();
        loginWindowOpened = false;
        return status();
    }

    public boolean isReady() {
        return status().isReady();
    }

    public Path sessionPath() {
        return Path.of(sessionDir).toAbsolutePath().normalize();
    }

    private Path confirmedMarkerPath() {
        return sessionPath().resolve(".smartmall-pdd-login-confirmed");
    }

    private String loginUrl() {
        return loginUrl == null || loginUrl.isBlank() ? DEFAULT_LOGIN_URL : loginUrl.trim();
    }

    private String resolveChromeCommand() {
        if (chromeCommand != null && !chromeCommand.isBlank()) return chromeCommand.trim();
        String programFiles = System.getenv("ProgramFiles");
        if (programFiles != null) {
            Path chrome = Path.of(programFiles, "Google", "Chrome", "Application", "chrome.exe");
            if (Files.exists(chrome)) return chrome.toString();
            Path edge = Path.of(programFiles, "Microsoft", "Edge", "Application", "msedge.exe");
            if (Files.exists(edge)) return edge.toString();
        }
        String programFilesX86 = System.getenv("ProgramFiles(x86)");
        if (programFilesX86 != null) {
            Path chrome = Path.of(programFilesX86, "Google", "Chrome", "Application", "chrome.exe");
            if (Files.exists(chrome)) return chrome.toString();
            Path edge = Path.of(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe");
            if (Files.exists(edge)) return edge.toString();
        }
        String localAppData = System.getenv("LOCALAPPDATA");
        if (localAppData != null) {
            Path chrome = Path.of(localAppData, "Google", "Chrome", "Application", "chrome.exe");
            if (Files.exists(chrome)) return chrome.toString();
        }
        return "chrome";
    }

    private LocalDateTime readConfirmedAt(Path marker) {
        if (!Files.exists(marker)) return null;
        try {
            return Files.readAllLines(marker, StandardCharsets.UTF_8).stream()
                    .filter(line -> line.startsWith("confirmedAt="))
                    .map(line -> line.substring("confirmedAt=".length()).trim())
                    .findFirst()
                    .map(LocalDateTime::parse)
                    .orElse(null);
        } catch (Exception ignored) {
            return null;
        }
    }

    private void deleteMarkerIfExists() throws IOException {
        Files.deleteIfExists(confirmedMarkerPath());
    }

    private boolean hasBrowserSessionEvidence() {
        Path profile = sessionPath();
        if (!Files.exists(profile)) return false;
        try (Stream<Path> stream = Files.walk(profile, 7)) {
            return stream
                    .filter(path -> Files.isRegularFile(path) && path.getFileName() != null)
                    .anyMatch(this::isUsefulSessionFile);
        } catch (IOException ignored) {
            return false;
        }
    }

    private boolean isUsefulSessionFile(Path path) {
        String name = path.getFileName().toString();
        if ("Cookies".equalsIgnoreCase(name)) {
            return containsPddCookieHint(path) || hasContent(path);
        }
        String normalized = path.toString().toLowerCase(Locale.ROOT);
        return normalized.contains("smartmallpdd")
                && (normalized.contains("local storage") || normalized.contains("session storage"))
                && hasContent(path);
    }

    private boolean containsPddCookieHint(Path cookiesFile) {
        try {
            byte[] bytes = Files.readAllBytes(cookiesFile);
            String text = new String(bytes, StandardCharsets.ISO_8859_1).toLowerCase(Locale.ROOT);
            return text.contains("yangkeduo.com") || text.contains("pinduoduo.com") || text.contains("pdd");
        } catch (IOException ignored) {
            return hasContent(cookiesFile);
        }
    }

    private boolean hasContent(Path file) {
        try {
            return Files.size(file) > 0;
        } catch (IOException ignored) {
            return false;
        }
    }
}
