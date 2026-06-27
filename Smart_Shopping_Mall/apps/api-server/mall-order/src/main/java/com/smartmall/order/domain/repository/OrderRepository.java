package com.smartmall.order.domain.repository;
import com.smartmall.order.domain.model.Order;
import java.util.*;
public interface OrderRepository {
    Order save(Order o);
    Optional<Order> findById(Long id);
    List<Order> findAll();
}
