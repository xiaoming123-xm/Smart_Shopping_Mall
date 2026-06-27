package com.smartmall.common.exception;

import com.smartmall.common.api.ResultCode;

/**
 * 业务异常。各模块抛出，由 mall-bootstrap 的全局处理器统一转成 R。
 */
public class BizException extends RuntimeException {

    private final int code;

    public BizException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }

    public BizException(ResultCode resultCode, String message) {
        super(message);
        this.code = resultCode.getCode();
    }

    public BizException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
