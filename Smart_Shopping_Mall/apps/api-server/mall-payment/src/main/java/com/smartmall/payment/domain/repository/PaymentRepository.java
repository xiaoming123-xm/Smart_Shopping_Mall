package com.smartmall.payment.domain.repository;
import com.smartmall.payment.domain.model.Payment;
import java.util.*;
public interface PaymentRepository {
    Payment save(Payment p);
    Optional<Payment> findById(Long id);
    List<Payment> findAll();
}
