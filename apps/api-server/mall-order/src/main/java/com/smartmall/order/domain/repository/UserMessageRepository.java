package com.smartmall.order.domain.repository;

import com.smartmall.order.domain.model.UserMessage;

import java.util.List;
import java.util.Optional;

public interface UserMessageRepository {
    UserMessage saveOrUpdateByBusinessKey(UserMessage message);

    List<UserMessage> findVisibleByMemberId(Long memberId);

    Optional<UserMessage> findById(Long id);

    void markRead(Long id);

    void hide(Long id);
}
