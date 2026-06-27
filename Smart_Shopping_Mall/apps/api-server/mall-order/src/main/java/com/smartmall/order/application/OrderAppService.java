package com.smartmall.order.application;
import com.smartmall.order.application.dto.OrderDTO;
import com.smartmall.order.application.dto.OrderItemDTO;
import com.smartmall.order.domain.model.Order;
import com.smartmall.order.domain.model.OrderItem;
import com.smartmall.order.domain.repository.OrderRepository;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor public class OrderAppService {
    private final OrderRepository repo;
    public List<OrderDTO> list(){ return repo.findAll().stream().map(this::toDTO).toList(); }
    public OrderDTO get(Long id){ return repo.findById(id).map(this::toDTO).orElseThrow(()->new BizException(ResultCode.ORDER_NOT_FOUND)); }
    /** 发货: 仅当已支付 */
    public OrderDTO ship(Long id){
        Order o=repo.findById(id).orElseThrow(()->new BizException(ResultCode.ORDER_NOT_FOUND));
        o.setStatus("SHIPPED"); repo.save(o); return toDTO(o);
    }
    private OrderDTO toDTO(Order o){
        OrderDTO d=new OrderDTO();
        d.setId(o.getId()); d.setOrderNo(o.getOrderNo()); d.setMemberId(o.getMemberId()); d.setStatus(o.getStatus());
        d.setTotalAmount(o.getTotalAmount()); d.setReceiver(o.getReceiver()); d.setAddress(o.getAddress()); d.setCreatedAt(o.getCreatedAt());
        if(o.getItems()!=null) d.setItems(o.getItems().stream().map(this::toItemDTO).toList());
        return d;
    }
    private OrderItemDTO toItemDTO(OrderItem it){
        OrderItemDTO d=new OrderItemDTO();
        d.setId(it.getId()); d.setSkuId(it.getSkuId()); d.setSkuCode(it.getSkuCode()); d.setProductName(it.getProductName()); d.setPrice(it.getPrice()); d.setQuantity(it.getQuantity());
        return d;
    }
}
