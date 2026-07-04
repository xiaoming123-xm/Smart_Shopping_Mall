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
        o.setStatus("PAID"); o.setTotalAmount(new BigDecimal("200.00")); o.setReceiver("用户"); o.setReceiverPhone("18699999999"); o.setAddress("湖北省武汉市武昌区八一路");
        o.setSender("悟空"); o.setSenderPhone("18600000000"); o.setSenderAddress("江苏省连云港市花果山水帘洞");
        OrderItem it=new OrderItem(); it.setSkuId(1L); it.setSkuCode("BIRD-TRACE-01"); it.setProductName("用户真迹 白鸟朝凤图 珍藏版"); it.setPrice(new BigDecimal("200.00")); it.setQuantity(1);
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
