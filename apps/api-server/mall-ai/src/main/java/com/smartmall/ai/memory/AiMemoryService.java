package com.smartmall.ai.memory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiMemoryService {
    private static final Long DEFAULT_MEMBER_ID = 1L;
    private static final Pattern SHOE_SIZE_PATTERN = Pattern.compile("(\\d{2})\\s*码");
    private static final Pattern BUDGET_PATTERN = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(?:元|块)(?:钱)?(?:以内|以下)?");

    private final AiMemoryRepository repository;

    public Long normalizeMemberId(Long memberId) {
        return memberId == null || memberId <= 0 ? DEFAULT_MEMBER_ID : memberId;
    }

    public void saveConversation(Long memberId, String userMessage, String aiReply) {
        Long id = normalizeMemberId(memberId);
        repository.saveMessage(id, "user", userMessage);
        repository.saveMessage(id, "assistant", aiReply);
        extractPreferences(id, userMessage);
    }

    public List<AiChatMessageDTO> listRecentMessages(Long memberId, int limit) {
        return repository.listRecentMessages(normalizeMemberId(memberId), limit);
    }

    public String buildPreferenceContext(Long memberId) {
        List<AiUserPreferenceDTO> preferences = repository.listPreferences(normalizeMemberId(memberId));
        if (preferences.isEmpty()) {
            return "";
        }

        List<String> lines = new ArrayList<>();
        findValue(preferences, "preferred_category").ifPresent(value -> lines.add("偏好品类：" + value));
        findValue(preferences, "shoe_size").ifPresent(value -> lines.add("鞋码：" + value));
        findValue(preferences, "preferred_color").ifPresent(value -> lines.add("偏好颜色：" + value));
        findValue(preferences, "budget_max").ifPresent(value -> lines.add("预算上限：" + value));

        if (lines.isEmpty()) {
            return "";
        }
        return "该用户历史偏好如下，可在推荐时优先参考，但不要强行假设：\n- " + String.join("\n- ", lines);
    }

    private void extractPreferences(Long memberId, String text) {
        if (text == null || text.isBlank()) {
            return;
        }
        String normalized = text.toLowerCase(Locale.ROOT);

        Matcher sizeMatcher = SHOE_SIZE_PATTERN.matcher(text);
        if (sizeMatcher.find()) {
            repository.upsertPreference(memberId, "shoe_size", sizeMatcher.group(1) + "码", text);
        }

        Matcher budgetMatcher = BUDGET_PATTERN.matcher(text);
        if (budgetMatcher.find()) {
            repository.upsertPreference(memberId, "budget_max", budgetMatcher.group(1) + "元以内", text);
        }

        detectColor(text).ifPresent(color -> repository.upsertPreference(memberId, "preferred_color", color, text));

        if (normalized.contains("鞋") || normalized.contains("运动鞋") || normalized.contains("跑步鞋")) {
            repository.upsertPreference(memberId, "preferred_category", "鞋靴", text);
        } else if (normalized.contains("衣") || normalized.contains("毛衣") || normalized.contains("外套")) {
            repository.upsertPreference(memberId, "preferred_category", "服装", text);
        } else if (normalized.contains("项链") || normalized.contains("礼物") || normalized.contains("饰品")) {
            repository.upsertPreference(memberId, "preferred_category", "礼品饰品", text);
        }
    }

    private Optional<String> detectColor(String text) {
        List<String> colors = List.of("红色", "白色", "黑色", "蓝色", "粉色", "灰色");
        return colors.stream().filter(text::contains).findFirst();
    }

    private Optional<String> findValue(List<AiUserPreferenceDTO> preferences, String key) {
        return preferences.stream()
                .filter(item -> key.equals(item.getPreferenceKey()))
                .map(AiUserPreferenceDTO::getPreferenceValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst();
    }
}
