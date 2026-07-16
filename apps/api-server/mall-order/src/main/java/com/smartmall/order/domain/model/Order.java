package com.smartmall.order.domain.model;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data public class Order {
    private Long id;
    private String orderNo;
    private Long memberId;
    private String status;       // CREATED 待支付, PAID 已支付, SHIPPED 已发货, RECEIVED 已收货, COMPLETED 已评价, CANCELLED 已取消, REFUND_REQUESTED 退货申请中, REFUNDED 已退款, REFUND_REJECTED 退货已拒绝
    private BigDecimal totalAmount;
    private String receiver;
    private String receiverPhone;
    private String address;
    private String sender;
    private String senderPhone;
    private String senderAddress;
    private String logisticsCompany;
    private String trackingNo;
    private LocalDateTime shippedAt;
    private LocalDateTime receivedAt;
    private Integer rating;
    private String reviewContent;
    private LocalDateTime reviewedAt;
    private String reviewReply;
    private LocalDateTime reviewRepliedAt;
    private String refundReason;
    private LocalDateTime refundRequestedAt;
    private String refundHandleNote;
    private LocalDateTime refundHandledAt;
    private LocalDateTime createdAt;
    private List<OrderItem> items;
}
