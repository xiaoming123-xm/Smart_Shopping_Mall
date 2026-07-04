package com.smartmall.common.api;

import com.smartmall.common.trace.TraceContext;

import java.io.Serializable;

/**
 * 缁熶竴鍝嶅簲浣撱€傛墍鏈?Controller 杩斿洖 R<T>銆?* <p>
 * traceId 瀛楁鐢变簤姹傚搷搴旂殑 TraceIdFilter 濉厖锛屼究浜庡墠绔嚭閿欐椂鑱氱被鍚嶅崟缁欐搷浣滀汉鍛樸€?*/
public class R<T> implements Serializable {

    private int code;
    private String message;
    private T data;
    private String traceId;

    public R() {
    }

    public R(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> R<T> ok() {
        return new R<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage(), null);
    }

    public static <T> R<T> ok(T data) {
        return new R<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage(), data);
    }

    public static <T> R<T> fail(ResultCode rc) {
        return new R<>(rc.getCode(), rc.getMessage(), null);
    }

    public static <T> R<T> fail(int code, String message) {
        return new R<>(code, message, null);
    }

    public R<T> withTraceId() {
        this.traceId = TraceContext.get();
        return this;
    }

    public boolean isSuccess() {
        return code == ResultCode.SUCCESS.getCode();
    }

    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    public String getTraceId() { return traceId; }
    public void setTraceId(String traceId) { this.traceId = traceId; }
}
