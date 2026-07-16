package com.smartmall.order.infrastructure.persistence;

import com.smartmall.order.domain.model.Order;
import com.smartmall.order.domain.model.OrderItem;
import com.smartmall.order.domain.repository.OrderRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile("!local")
public class InMemoryOrderRepository implements OrderRepository {
    private final Map<Long, Order> store = new ConcurrentHashMap<>();
    private final AtomicLong idGen = new AtomicLong(0);
    private final AtomicLong itemIdGen = new AtomicLong(0);

    @Override
    public Order save(Order order) {
        if (order.getId() == null) {
            order.setId(idGen.incrementAndGet());
            order.setCreatedAt(LocalDateTime.now());
        }
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getId() == null) {
                    item.setId(itemIdGen.incrementAndGet());
                }
                item.setOrderId(order.getId());
            }
        }
        store.put(order.getId(), order);
        return order;
    }

    @Override
    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Order> findAll() {
        return store.values().stream()
                .sorted(Comparator.comparing(Order::getId).reversed())
                .toList();
    }
}
