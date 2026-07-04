package com.smartmall.bootstrap.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 鍏ㄥ眬 Web 閰嶇疆銆?* <ul>
 *   <li>寮€鍙戞湡鍏佽 admin-web(6002) / storefront-web(6003) 璺ㄥ煙璋冪敤鍚庣 8080</li>
 *   <li>鐢熶骇鐜搴旈€氳繃 Nginx 鍚屾簮鍙嶅悜浠ｇ悊锛岃繖閲岀殑鏀捐鍙寜 profile 鏀剁揣</li>
 *   <li>瀵瑰鏆撮湶 X-Trace-Id 鍝嶅簲澶达紝渚夸簬鍓嶇敊璇姤鍛藉叧鑱?/li>
 * </ul>
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
                .exposedHeaders("X-Trace-Id")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
