package com.smartmall.order.application.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data public class OrderDTO {
    private Long id; private String orderNo; private Long memberId; private String status; private BigDecimal totalAmount;
    private String statusText; private String receiver; private String receiverPhone; private String address;
    private String sender; private String senderPhone; private String senderAddress; private String logisticsCompany; private String trackingNo;
    private LocalDateTime shippedAt; private LocalDateTime receivedAt; private Integer rating; private String reviewContent;
    private LocalDateTime reviewedAt; private String reviewReply; private LocalDateTime reviewRepliedAt;
    private String refundReason; private LocalDateTime refundRequestedAt; private String refundHandleNote; private LocalDateTime refundHandledAt;
    private LocalDateTime createdAt; private List<OrderItemDTO> items; private List<LogisticsTraceDTO> logisticsTraces;
}
