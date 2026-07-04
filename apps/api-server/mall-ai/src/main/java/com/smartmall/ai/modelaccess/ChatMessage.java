package com.smartmall.ai.modelaccess;
import lombok.AllArgsConstructor;
import lombok.Data;
/** 通用对话消息(与具体厂商无关)。 */
@Data @AllArgsConstructor public class ChatMessage {
    private String role;     // system / user / assistant
    private String content;
    public static ChatMessage system(String c){ return new ChatMessage("system", c); }
    public static ChatMessage user(String c){ return new ChatMessage("user", c); }
    public static ChatMessage assistant(String c){ return new ChatMessage("assistant", c); }
}
