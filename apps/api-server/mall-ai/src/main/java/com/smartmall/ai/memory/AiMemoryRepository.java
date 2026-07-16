package com.smartmall.ai.memory;

import java.util.List;

public interface AiMemoryRepository {
    void saveMessage(Long memberId, String role, String message);

    List<AiChatMessageDTO> listRecentMessages(Long memberId, int limit);

    void upsertPreference(Long memberId, String key, String value, String sourceText);

    List<AiUserPreferenceDTO> listPreferences(Long memberId);
}
