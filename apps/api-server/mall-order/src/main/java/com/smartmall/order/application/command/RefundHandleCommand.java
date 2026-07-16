package com.smartmall.order.application.command;

import lombok.Data;

@Data
public class RefundHandleCommand {
    private String action;
    private String note;
}
