package com.smartmall.order.infrastructure.persistence;

import com.smartmall.order.domain.model.UserMessage;
import com.smartmall.order.domain.repository.UserMessageRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile("!local")
public class InMemoryUserMessageRepository implements UserMessageRepository {
    private final Map<Long, UserMessage> store = new ConcurrentHashMap<>();
    private final AtomicLong idGen = new AtomicLong(0);

    @Override
    public UserMessage saveOrUpdateByBusinessKey(UserMessage message) {
        Optional<UserMessage> existing = store.values().stream()
                .filter(item -> item.getBusinessKey().equals(message.getBusinessKey()))
                .findFirst();
        LocalDateTime now = LocalDateTime.now();
        if (existing.isPresent()) {
            UserMessage current = existing.get();
            current.setMemberId(message.getMemberId());
            current.setOrderId(message.getOrderId());
            current.setType(message.getType());
            current.setTitle(message.getTitle());
            current.setContent(message.getContent());
            current.setActionText(message.getActionText());
            current.setActionUrl(message.getActionUrl());
            current.setReadFlag(false);
            current.setVisible(true);
            current.setUpdatedAt(now);
            return current;
        }
        message.setId(idGen.incrementAndGet());
        message.setReadFlag(Boolean.TRUE.equals(message.getReadFlag()));
        message.setVisible(!Boolean.FALSE.equals(message.getVisible()));
        message.setCreatedAt(now);
        message.setUpdatedAt(now);
        store.put(message.getId(), message);
        return message;
    }

    @Override
    public List<UserMessage> findVisibleByMemberId(Long memberId) {
        return store.values().stream()
                .filter(message -> memberId.equals(message.getMemberId()))
                .filter(message -> !Boolean.FALSE.equals(message.getVisible()))
                .sorted(Comparator.comparing(UserMessage::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
    }

    @Override
    public Optional<UserMessage> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public void markRead(Long id) {
        Optional.ofNullable(store.get(id)).ifPresent(message -> {
            message.setReadFlag(true);
            message.setUpdatedAt(LocalDateTime.now());
        });
    }

    @Override
    public void hide(Long id) {
        Optional.ofNullable(store.get(id)).ifPresent(message -> {
            message.setVisible(false);
            message.setUpdatedAt(LocalDateTime.now());
        });
    }
}
