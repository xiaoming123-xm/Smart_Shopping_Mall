package com.smartmall.payment.interfaces.web;
import com.smartmall.payment.application.PaymentAppService;
import com.smartmall.payment.application.command.CreatePaymentCommand;
import com.smartmall.payment.application.command.PaymentCallbackCommand;
import com.smartmall.payment.application.dto.PaymentDTO;
import com.smartmall.common.api.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/payments") @RequiredArgsConstructor
public class PaymentController {
    private final PaymentAppService svc;
    @GetMapping public R<List<PaymentDTO>> list(){ return R.ok(svc.list()); }
    @GetMapping("/{id}") public R<PaymentDTO> get(@PathVariable Long id){ return R.ok(svc.get(id)); }
    @PostMapping public R<PaymentDTO> create(@Valid @RequestBody CreatePaymentCommand cmd){ return R.ok(svc.create(cmd)); }
    @PostMapping("/{id}/pay") public R<PaymentDTO> pay(@PathVariable Long id){ return R.ok(svc.pay(id)); }
    @PostMapping("/callback") public R<PaymentDTO> callback(@Valid @RequestBody PaymentCallbackCommand cmd){ return R.ok(svc.callback(cmd)); }
    @PostMapping("/{id}/refund") public R<PaymentDTO> refund(@PathVariable Long id){ return R.ok(svc.refund(id)); }
}
