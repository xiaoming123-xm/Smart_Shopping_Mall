package com.smartmall.payment.interfaces.web;
import com.smartmall.payment.application.PaymentAppService;
import com.smartmall.payment.application.dto.PaymentDTO;
import com.smartmall.common.api.R;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/payments") @RequiredArgsConstructor
public class PaymentController {
    private final PaymentAppService svc;
    @GetMapping public R<List<PaymentDTO>> list(){ return R.ok(svc.list()); }
}
