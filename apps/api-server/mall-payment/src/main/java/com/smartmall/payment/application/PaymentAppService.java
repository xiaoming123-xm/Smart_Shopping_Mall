package com.smartmall.payment.application;
import com.smartmall.payment.application.command.CreatePaymentCommand;
import com.smartmall.payment.application.command.PaymentCallbackCommand;
import com.smartmall.payment.application.dto.PaymentDTO;
import com.smartmall.payment.domain.model.Payment;
import com.smartmall.payment.domain.repository.PaymentRepository;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Service @RequiredArgsConstructor public class PaymentAppService {
    private final PaymentRepository repo;
    public List<PaymentDTO> list(){ return repo.findAll().stream().map(this::toDTO).toList(); }
    public PaymentDTO get(Long id){ return toDTO(load(id)); }
    public PaymentDTO getByOrderId(Long orderId){ return repo.findByOrderId(orderId).map(this::toDTO).orElseThrow(()->new BizException(ResultCode.PAYMENT_NOT_FOUND)); }

    /** 创建支付单(待支付)。同一订单幂等: 已存在则直接返回。 */
    public PaymentDTO create(CreatePaymentCommand cmd){
        if(cmd.getAmount()==null||cmd.getAmount().signum()<=0) throw new BizException(ResultCode.PAYMENT_AMOUNT_INVALID);
        return repo.findByOrderId(cmd.getOrderId()).map(this::toDTO).orElseGet(()->{
            Payment p=new Payment(); p.setPaymentNo("PAY"+System.currentTimeMillis()); p.setOrderId(cmd.getOrderId());
            p.setChannel(cmd.getChannel()); p.setStatus("PENDING"); p.setAmount(cmd.getAmount());
            repo.save(p); return toDTO(p);
        });
    }

    /** 主动支付(模拟拉起渠道支付成功): 仅当待支付 */
    public PaymentDTO pay(Long id){
        Payment p=load(id); requireStatus(p,"PENDING"); markPaid(p); return toDTO(p);
    }

    /**
     * 渠道支付回调。幂等: 重复回调若已是 PAID 则直接返回成功, 不重复处理。
     */
    public PaymentDTO callback(PaymentCallbackCommand cmd){
        Payment p=load(cmd.getPaymentId());
        if("PAID".equals(p.getStatus())) return toDTO(p); // 幂等
        if(!"SUCCESS".equalsIgnoreCase(cmd.getTradeStatus())) throw new BizException(ResultCode.PAYMENT_STATE_INVALID,"渠道回调非成功状态");
        if(!"PENDING".equals(p.getStatus())) throw new BizException(ResultCode.PAYMENT_STATE_INVALID);
        if(cmd.getAmount()!=null && cmd.getAmount().compareTo(p.getAmount())!=0) throw new BizException(ResultCode.PAYMENT_AMOUNT_INVALID);
        markPaid(p); return toDTO(p);
    }

    /** 退款: 仅当已支付 */
    public PaymentDTO refund(Long id){
        Payment p=load(id);
        if(!"PAID".equals(p.getStatus())) throw new BizException(ResultCode.REFUND_NOT_ALLOWED);
        p.setStatus("REFUNDED"); repo.save(p); return toDTO(p);
    }

    private void markPaid(Payment p){ p.setStatus("PAID"); p.setPaidAt(LocalDateTime.now()); repo.save(p); }
    private Payment load(Long id){ return repo.findById(id).orElseThrow(()->new BizException(ResultCode.PAYMENT_NOT_FOUND)); }
    private void requireStatus(Payment p,String expected){ if(!expected.equals(p.getStatus())) throw new BizException(ResultCode.PAYMENT_STATE_INVALID); }
    private PaymentDTO toDTO(Payment p){
        PaymentDTO d=new PaymentDTO();
        d.setId(p.getId()); d.setPaymentNo(p.getPaymentNo()); d.setOrderId(p.getOrderId()); d.setChannel(p.getChannel());
        d.setStatus(p.getStatus()); d.setAmount(p.getAmount()); d.setCreatedAt(p.getCreatedAt()); d.setPaidAt(p.getPaidAt());
        return d;
    }
}
