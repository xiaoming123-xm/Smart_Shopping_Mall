package com.smartmall.payment.infrastructure.persistence;
import com.smartmall.payment.domain.model.Payment;
import com.smartmall.payment.domain.repository.PaymentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
@Repository public class InMemoryPaymentRepository implements PaymentRepository {
    private final Map<Long,Payment> store=new ConcurrentHashMap<>();
    private final AtomicLong idGen=new AtomicLong(0);
    @PostConstruct public void seed(){
        Payment p=new Payment(); p.setPaymentNo("PAY"+System.currentTimeMillis()); p.setOrderId(1L);
        p.setChannel("MOCK"); p.setStatus("PAID"); p.setAmount(new BigDecimal("158.00")); p.setPaidAt(LocalDateTime.now());
        save(p);
    }
    @Override public Payment save(Payment p){ if(p.getId()==null){p.setId(idGen.incrementAndGet());p.setCreatedAt(LocalDateTime.now());} store.put(p.getId(),p); return p; }
    @Override public Optional<Payment> findById(Long id){ return Optional.ofNullable(store.get(id)); }
    @Override public List<Payment> findAll(){ return store.values().stream().sorted(Comparator.comparing(Payment::getId).reversed()).toList(); }
}
