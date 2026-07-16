package com.smartmall.order.application.command;

import lombok.Data;

@Data
public class RefundRequestCommand {
    private String reason;
}
