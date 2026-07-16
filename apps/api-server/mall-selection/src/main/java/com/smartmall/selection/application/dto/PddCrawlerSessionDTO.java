package com.smartmall.selection.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PddCrawlerSessionDTO {
    private boolean ready;
    private boolean profileExists;
    private boolean loginWindowOpened;
    private LocalDateTime confirmedAt;
    private String loginUrl;
    private String message;
}
