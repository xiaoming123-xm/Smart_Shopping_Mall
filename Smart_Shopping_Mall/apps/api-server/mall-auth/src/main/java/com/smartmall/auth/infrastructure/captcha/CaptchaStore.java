package com.smartmall.auth.infrastructure.captcha;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
@Component
public class CaptchaStore {
    private record Entry(String code, Instant exp){}
    private final Map<String,Entry> store = new ConcurrentHashMap<>();
    public void put(String key, String code){
        store.put(key, new Entry(code, Instant.now().plusSeconds(300)));
    }
    public boolean verifyAndRemove(String key, String code){
        Entry e = store.remove(key);
        if(e==null||Instant.now().isAfter(e.exp())) return false;
        return e.code().equalsIgnoreCase(code);
    }
}