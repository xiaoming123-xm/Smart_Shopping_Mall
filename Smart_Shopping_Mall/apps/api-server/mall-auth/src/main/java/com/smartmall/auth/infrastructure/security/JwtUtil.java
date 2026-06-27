package com.smartmall.auth.infrastructure.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
@Component
public class JwtUtil {
    @Value("${jwt.secret:SmartMallSecretKey2024XxYyZz!!!!!}")
    private String secret;
    @Value("${jwt.expire-ms:86400000}")
    private long expireMs;

    private Key key(){ return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); }

    public String generate(String username, Long userId){
        return Jwts.builder()
            .setSubject(username)
            .claim("uid", userId)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis()+expireMs))
            .signWith(key(), SignatureAlgorithm.HS256)
            .compact();
    }

    public Claims parse(String token){
        return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token).getBody();
    }

    public boolean valid(String token){
        try{ parse(token); return true; }catch(JwtException|IllegalArgumentException e){ return false; }
    }
}