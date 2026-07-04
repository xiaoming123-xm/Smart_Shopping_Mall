package com.smartmall.auth.application;
import com.smartmall.auth.application.command.LoginCommand;
import com.smartmall.auth.application.dto.CaptchaDTO;
import com.smartmall.auth.application.dto.LoginDTO;
import com.smartmall.auth.domain.model.AdminUser;
import com.smartmall.auth.domain.repository.AdminUserRepository;
import com.smartmall.auth.infrastructure.captcha.CaptchaStore;
import com.smartmall.auth.infrastructure.security.JwtUtil;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.*;
@Service @RequiredArgsConstructor
public class AuthAppService {
    private final AdminUserRepository userRepo;
    private final CaptchaStore captchaStore;
    private final JwtUtil jwtUtil;

    public CaptchaDTO generateCaptcha() {
        String key = UUID.randomUUID().toString();
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder();
        for(int i=0;i<4;i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        String code = sb.toString();
        captchaStore.put(key, code);
        CaptchaDTO dto = new CaptchaDTO();
        dto.setCaptchaKey(key); dto.setImageBase64("data:image/png;base64,"+buildImage(code));
        return dto;
    }

    private String buildImage(String text) {
        int w=120, h=40;
        BufferedImage img = new BufferedImage(w,h,BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(new Color(245,245,245)); g.fillRect(0,0,w,h);
        Random rnd=new Random();
        g.setColor(new Color(200,200,200));
        for(int i=0;i<4;i++) g.drawLine(rnd.nextInt(w),rnd.nextInt(h),rnd.nextInt(w),rnd.nextInt(h));
        g.setFont(new Font("Arial",Font.BOLD,24));
        for(int i=0;i<text.length();i++){
            g.setColor(new Color(rnd.nextInt(100),rnd.nextInt(100)+50,rnd.nextInt(100)));
            g.drawString(String.valueOf(text.charAt(i)), 12+i*25, 30);
        }
        g.dispose();
        try { ByteArrayOutputStream bos=new ByteArrayOutputStream(); ImageIO.write(img,"png",bos);
              return Base64.getEncoder().encodeToString(bos.toByteArray()); }
        catch(Exception e){ throw new RuntimeException(e); }
    }

    public LoginDTO login(LoginCommand cmd) {
        if(!captchaStore.verifyAndRemove(cmd.getCaptchaKey(), cmd.getCaptchaCode()))
            throw new BizException(ResultCode.CAPTCHA_INVALID);
        AdminUser user = userRepo.findByUsername(cmd.getUsername())
            .orElseThrow(()->new BizException(ResultCode.LOGIN_FAILED));
        if(!user.getEnabled()) throw new BizException(ResultCode.LOGIN_FAILED);
        if(!user.getPasswordHash().equals(cmd.getPassword()))
            throw new BizException(ResultCode.LOGIN_FAILED);
        LoginDTO dto = new LoginDTO();
        dto.setToken(jwtUtil.generate(user.getUsername(), user.getId()));
        dto.setUsername(user.getUsername()); dto.setNickname(user.getNickname());
        return dto;
    }
}