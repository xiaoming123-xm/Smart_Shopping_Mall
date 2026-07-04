package com.smartmall.order.application.command;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShipOrderCommand {
    @NotBlank private String sender;
    @NotBlank private String senderPhone;
    @NotBlank private String senderAddress;
    @NotBlank private String logisticsCompany;
    @NotBlank private String trackingNo;
}
