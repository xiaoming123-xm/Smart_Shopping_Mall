package com.smartmall.bootstrap.web;

import com.smartmall.common.trace.TraceContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * 璇锋眰璺熻釜 ID 杩囨护鍣ㄣ€?* <ul>
 *   <li>浼樺厛璇诲彇璇锋眰澶?X-Trace-Id锛屽鏋滃瓨鍦ㄥ垯閲嶅敤锛屼究浜庡墠绔ā鎷熼摼璺煡璇?/li>
 *   <li>鑻ユ病鏈夊垯鐢熸垚 UUID 浣滀负 traceId</li>
 *   <li>鍐欏叆 ThreadLocal + SLF4J MDC锛屽苟鍐欏洖鍝嶅簲澶?/li>
 *   <li>蹇呴』鏀惧湪 JwtAuthFilter 涔嬪墠锛岀‘淇′簡 ExceptionHandler 涔熻兘璇诲埌 traceId</li>
 * </ul>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String traceId = request.getHeader(TraceContext.HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString().replace("-", "");
        }
        try {
            TraceContext.set(traceId);
            response.setHeader(TraceContext.HEADER, traceId);
            filterChain.doFilter(request, response);
        } finally {
            TraceContext.clear();
        }
    }
}
