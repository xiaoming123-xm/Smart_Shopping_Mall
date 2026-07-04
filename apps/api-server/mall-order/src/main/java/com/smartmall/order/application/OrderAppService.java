package com.smartmall.order.application;

import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import com.smartmall.order.application.command.CreateOrderCommand;
import com.smartmall.order.application.command.ReplyReviewCommand;
import com.smartmall.order.application.command.ReviewOrderCommand;
import com.smartmall.order.application.command.ShipOrderCommand;
import com.smartmall.order.application.dto.LogisticsTraceDTO;
import com.smartmall.order.application.dto.OrderDTO;
import com.smartmall.order.application.dto.OrderItemDTO;
import com.smartmall.order.domain.model.Order;
import com.smartmall.order.domain.model.OrderItem;
import com.smartmall.order.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderAppService {
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OrderRepository repo;

    public List<OrderDTO> list() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    public List<OrderDTO> reviews() {
        return repo.findAll().stream()
            .filter(o -> o.getReviewContent() != null && !o.getReviewContent().isBlank())
            .map(this::toDTO)
            .toList();
    }

    public OrderDTO get(Long id) {
        return toDTO(load(id));
    }

    /** 创建订单(待支付) */
    public OrderDTO create(CreateOrderCommand cmd) {
        if (cmd.getItems() == null || cmd.getItems().isEmpty()) {
            throw new BizException(ResultCode.ORDER_ITEMS_EMPTY);
        }
        Order o = new Order();
        o.setOrderNo("SO" + System.currentTimeMillis());
        o.setMemberId(cmd.getMemberId());
        o.setStatus("CREATED");
        o.setReceiver(cmd.getReceiver());
        o.setReceiverPhone(cmd.getReceiverPhone());
        o.setAddress(cmd.getAddress());

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (CreateOrderCommand.Item i : cmd.getItems()) {
            OrderItem it = new OrderItem();
            it.setSkuId(i.getSkuId());
            it.setSkuCode(i.getSkuCode());
            it.setProductName(i.getProductName());
            it.setPrice(i.getPrice());
            it.setQuantity(i.getQuantity());
            items.add(it);
            total = total.add(i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())));
        }
        o.setItems(items);
        o.setTotalAmount(total);
        repo.save(o);
        return toDTO(o);
    }

    /** 支付成功回写: 仅当待支付 */
    public OrderDTO pay(Long id) {
        Order o = load(id);
        requireStatus(o, "CREATED");
        o.setStatus("PAID");
        repo.save(o);
        return toDTO(o);
    }

    /** 发货: 仅当已支付 */
    public OrderDTO ship(Long id) {
        ShipOrderCommand cmd = new ShipOrderCommand();
        cmd.setSender("悟空");
        cmd.setSenderPhone("18600000000");
        cmd.setSenderAddress("江苏省连云港市花果山水帘洞");
        cmd.setLogisticsCompany("顺丰速运");
        cmd.setTrackingNo("SF" + System.currentTimeMillis());
        return ship(id, cmd);
    }

    /** 发货: 仅当已支付 */
    public OrderDTO ship(Long id, ShipOrderCommand cmd) {
        Order o = load(id);
        requireStatus(o, "PAID");
        o.setStatus("SHIPPED");
        o.setSender(cmd.getSender());
        o.setSenderPhone(cmd.getSenderPhone());
        o.setSenderAddress(cmd.getSenderAddress());
        o.setLogisticsCompany(cmd.getLogisticsCompany());
        o.setTrackingNo(cmd.getTrackingNo());
        o.setShippedAt(LocalDateTime.now());
        repo.save(o);
        return toDTO(o);
    }

    /** 确认收货: 仅当已发货 */
    public OrderDTO receive(Long id) {
        Order o = load(id);
        requireStatus(o, "SHIPPED");
        o.setStatus("RECEIVED");
        o.setReceivedAt(LocalDateTime.now());
        repo.save(o);
        return toDTO(o);
    }

    /** 完成: 兼容旧接口, 新流程中由评价触发。 */
    public OrderDTO complete(Long id) {
        Order o = load(id);
        if ("SHIPPED".equals(o.getStatus())) {
            o.setReceivedAt(LocalDateTime.now());
        } else {
            requireStatus(o, "RECEIVED");
        }
        o.setStatus("COMPLETED");
        repo.save(o);
        return toDTO(o);
    }

    /** 取消: 仅当待支付 */
    public OrderDTO cancel(Long id) {
        Order o = load(id);
        requireStatus(o, "CREATED");
        o.setStatus("CANCELLED");
        repo.save(o);
        return toDTO(o);
    }

    /** 评价: 仅当已收货, 评价后订单完成。 */
    public OrderDTO review(Long id, ReviewOrderCommand cmd) {
        Order o = load(id);
        requireStatus(o, "RECEIVED");
        o.setRating(cmd.getRating());
        o.setReviewContent(cmd.getContent());
        o.setReviewedAt(LocalDateTime.now());
        o.setStatus("COMPLETED");
        repo.save(o);
        return toDTO(o);
    }

    /** 商家回复评价。 */
    public OrderDTO replyReview(Long id, ReplyReviewCommand cmd) {
        Order o = load(id);
        if (o.getReviewContent() == null || o.getReviewContent().isBlank()) {
            throw new BizException(ResultCode.ORDER_STATE_INVALID);
        }
        o.setReviewReply(cmd.getReply());
        o.setReviewRepliedAt(LocalDateTime.now());
        repo.save(o);
        return toDTO(o);
    }

    public List<LogisticsTraceDTO> logistics(Long id) {
        return buildLogistics(load(id));
    }

    private Order load(Long id) {
        return repo.findById(id).orElseThrow(() -> new BizException(ResultCode.ORDER_NOT_FOUND));
    }

    private void requireStatus(Order o, String expected) {
        if (!expected.equals(o.getStatus())) {
            throw new BizException(ResultCode.ORDER_STATE_INVALID);
        }
    }

    private OrderDTO toDTO(Order o) {
        OrderDTO d = new OrderDTO();
        d.setId(o.getId());
        d.setOrderNo(o.getOrderNo());
        d.setMemberId(o.getMemberId());
        d.setStatus(o.getStatus());
        d.setStatusText(statusText(o.getStatus()));
        d.setTotalAmount(o.getTotalAmount());
        d.setReceiver(o.getReceiver());
        d.setReceiverPhone(o.getReceiverPhone());
        d.setAddress(o.getAddress());
        d.setSender(o.getSender());
        d.setSenderPhone(o.getSenderPhone());
        d.setSenderAddress(o.getSenderAddress());
        d.setLogisticsCompany(o.getLogisticsCompany());
        d.setTrackingNo(o.getTrackingNo());
        d.setShippedAt(o.getShippedAt());
        d.setReceivedAt(o.getReceivedAt());
        d.setRating(o.getRating());
        d.setReviewContent(o.getReviewContent());
        d.setReviewedAt(o.getReviewedAt());
        d.setReviewReply(o.getReviewReply());
        d.setReviewRepliedAt(o.getReviewRepliedAt());
        d.setCreatedAt(o.getCreatedAt());
        d.setLogisticsTraces(buildLogistics(o));
        if (o.getItems() != null) {
            d.setItems(o.getItems().stream().map(this::toItemDTO).toList());
        }
        return d;
    }

    private OrderItemDTO toItemDTO(OrderItem it) {
        OrderItemDTO d = new OrderItemDTO();
        d.setId(it.getId());
        d.setSkuId(it.getSkuId());
        d.setSkuCode(it.getSkuCode());
        d.setProductName(it.getProductName());
        d.setPrice(it.getPrice());
        d.setQuantity(it.getQuantity());
        return d;
    }

    private List<LogisticsTraceDTO> buildLogistics(Order o) {
        if (o.getShippedAt() == null) {
            return List.of();
        }
        LocalDateTime base = o.getShippedAt();
        String dest = o.getAddress() == null ? "收货地址" : o.getAddress();
        List<LogisticsTraceDTO> traces = new ArrayList<>();
        traces.add(new LogisticsTraceDTO(format(base.minusMinutes(66)), safe(o.getSenderAddress(), "商家仓库") + "（起点）"));
        traces.add(new LogisticsTraceDTO(format(base.minusMinutes(51)), "武汉黄陂横店街道"));
        traces.add(new LogisticsTraceDTO(format(base.minusMinutes(36)), "郑州新郑薛店镇"));
        traces.add(new LogisticsTraceDTO(format(base.minusMinutes(26)), "泉州晋江磁灶镇"));
        traces.add(new LogisticsTraceDTO(format(base.minusMinutes(16)), "海口美兰机场物流中心"));
        traces.add(new LogisticsTraceDTO(format(base), "已送达（" + dest + "）"));
        if (o.getReceivedAt() != null || "RECEIVED".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus())) {
            LocalDateTime received = o.getReceivedAt() == null ? base.plusMinutes(8) : o.getReceivedAt();
            traces.add(new LogisticsTraceDTO(format(received), "收件人已确认收货"));
        }
        return traces;
    }

    private String statusText(String status) {
        if ("CREATED".equals(status)) return "待付款";
        if ("PAID".equals(status)) return "待发货";
        if ("SHIPPED".equals(status)) return "待收货";
        if ("RECEIVED".equals(status)) return "待评价";
        if ("COMPLETED".equals(status)) return "已完成";
        if ("CANCELLED".equals(status)) return "已取消";
        return status;
    }

    private String format(LocalDateTime time) {
        return time == null ? "" : TIME_FMT.format(time);
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
