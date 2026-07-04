package com.smartmall.order.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LogisticsTraceDTO {
    private String time;
    private String content;
}
