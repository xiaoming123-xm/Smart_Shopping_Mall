package com.smartmall.bootstrap.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 全局 Web 配置。
 * 开发期允许 admin-web(6002) / storefront-web(6003) 跨域调用后端 8080。
 * 生产环境应通过 Nginx 同源反向代理，这里的放行可按 profile 收紧。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                        "http://localhost:6002",
                        "http://localhost:6003",
                        "http://127.0.0.1:6002",
                        "http://127.0.0.1:6003"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
