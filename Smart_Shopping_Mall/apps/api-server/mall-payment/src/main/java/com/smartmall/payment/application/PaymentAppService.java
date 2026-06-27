package com.smartmall.payment.application;
import com.smartmall.payment.application.dto.PaymentDTO;
import com.smartmall.payment.domain.model.Payment;
import com.smartmall.payment.domain.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor public class PaymentAppService {
    private final PaymentRepository repo;
    public List<PaymentDTO> list(){ return repo.findAll().stream().map(this::toDTO).toList(); }
    private PaymentDTO toDTO(Payment p){
        PaymentDTO d=new PaymentDTO();
        d.setId(p.getId()); d.setPaymentNo(p.getPaymentNo()); d.setOrderId(p.getOrderId()); d.setChannel(p.getChannel());
        d.setStatus(p.getStatus()); d.setAmount(p.getAmount()); d.setCreatedAt(p.getCreatedAt()); d.setPaidAt(p.getPaidAt());
        return d;
    }
}
