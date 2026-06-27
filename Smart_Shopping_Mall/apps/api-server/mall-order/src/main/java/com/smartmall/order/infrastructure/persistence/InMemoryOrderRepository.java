package com.smartmall.order.infrastructure.persistence;
import com.smartmall.order.domain.model.Order;
import com.smartmall.order.domain.model.OrderItem;
import com.smartmall.order.domain.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
@Repository public class InMemoryOrderRepository implements OrderRepository {
    private final Map<Long,Order> store=new ConcurrentHashMap<>();
    private final AtomicLong idGen=new AtomicLong(0);
    private final AtomicLong itemIdGen=new AtomicLong(0);
    @PostConstruct public void seed(){
        Order o=new Order(); o.setOrderNo("SO"+System.currentTimeMillis()); o.setMemberId(1L);
        o.setStatus("PAID"); o.setTotalAmount(new BigDecimal("158.00")); o.setReceiver("张三"); o.setAddress("北京市朝阳区");
        OrderItem it=new OrderItem(); it.setSkuId(1L); it.setSkuCode("TS-RED-XL"); it.setProductName("纯棉基础款T恤"); it.setPrice(new BigDecimal("79.00")); it.setQuantity(2);
        o.setItems(new ArrayList<>(List.of(it)));
        save(o);
    }
    @Override public Order save(Order o){
        if(o.getId()==null){ o.setId(idGen.incrementAndGet()); o.setCreatedAt(LocalDateTime.now()); }
        if(o.getItems()!=null) for(OrderItem it: o.getItems()){ if(it.getId()==null) it.setId(itemIdGen.incrementAndGet()); it.setOrderId(o.getId()); }
        store.put(o.getId(),o); return o;
    }
    @Override public Optional<Order> findById(Long id){ return Optional.ofNullable(store.get(id)); }
    @Override public List<Order> findAll(){ return store.values().stream().sorted(Comparator.comparing(Order::getId).reversed()).toList(); }
}
