package com.smartmall.order.application;

import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import com.smartmall.order.application.dto.UserMessageDTO;
import com.smartmall.order.domain.model.UserMessage;
import com.smartmall.order.domain.repository.UserMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserMessageAppService {
    private final UserMessageRepository repo;

    public List<UserMessageDTO> list(Long memberId) {
        Long targetMemberId = memberId == null ? 1L : memberId;
        return repo.findVisibleByMemberId(targetMemberId).stream().map(this::toDTO).toList();
    }

    public UserMessageDTO markRead(Long id) {
        ensureExists(id);
        repo.markRead(id);
        return toDTO(repo.findById(id).orElseThrow(() -> new BizException(ResultCode.NOT_FOUND)));
    }

    public void hide(Long id) {
        ensureExists(id);
        repo.hide(id);
    }

    private void ensureExists(Long id) {
        repo.findById(id).orElseThrow(() -> new BizException(ResultCode.NOT_FOUND));
    }

    private UserMessageDTO toDTO(UserMessage message) {
        UserMessageDTO dto = new UserMessageDTO();
        dto.setId(message.getId());
        dto.setMemberId(message.getMemberId());
        dto.setOrderId(message.getOrderId());
        dto.setBusinessKey(message.getBusinessKey());
        dto.setType(message.getType());
        dto.setTitle(message.getTitle());
        dto.setContent(message.getContent());
        dto.setActionText(message.getActionText());
        dto.setActionUrl(message.getActionUrl());
        dto.setReadFlag(message.getReadFlag());
        dto.setVisible(message.getVisible());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());
        return dto;
    }
}
