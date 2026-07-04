package com.smartmall.selection.application.command;

import lombok.Data;

@Data
public class StartSelectionCrawlerCommand {
    private Long categoryId;
    private String keyword;
}
