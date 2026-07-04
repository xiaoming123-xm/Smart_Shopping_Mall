package com.smartmall.bootstrap.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmall.auth.infrastructure.security.JwtUtil;
import com.smartmall.common.api.R;
import com.smartmall.common.api.ResultCode;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT 认证过滤器。
 * 放行登录/验证码/健康检查/CORS 预检，其余 /api/** 请求需携带 Authorization: Bearer <token>。
 * 校验失败统一返回 R.fail(UNAUTHORIZED)，HTTP 200 + 业务 code，前端拦截后跳登录。
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** 白名单前缀：无需登录即可访问。 */
    private static final List<String> WHITELIST = List.of(
            "/api/auth/",
            "/api/catalog/products",
            "/api/orders",
            "/api/payments",
            "/api/ai/",
            "/actuator/"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        // 放行 CORS 预检
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        // 只拦截 /api/** 业务接口，其余（静态资源等）放行
        if (!uri.startsWith("/api/")) {
            return true;
        }
        for (String w : WHITELIST) {
            if (uri.startsWith(w)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            writeUnauthorized(response);
            return;
        }
        String token = header.substring(7).trim();
        if (token.isEmpty() || !jwtUtil.valid(token)) {
            writeUnauthorized(response);
            return;
        }
        try {
            Claims claims = jwtUtil.parse(token);
            // 透传当前登录用户信息，供下游 Controller 取用
            request.setAttribute("currentUsername", claims.getSubject());
            request.setAttribute("currentUserId", claims.get("uid"));
        } catch (Exception e) {
            writeUnauthorized(response);
            return;
        }
        filterChain.doFilter(request, response);
    }

    private void writeUnauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        R<Void> body = R.fail(ResultCode.UNAUTHORIZED);
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
