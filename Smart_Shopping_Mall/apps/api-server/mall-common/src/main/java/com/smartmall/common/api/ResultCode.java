package com.smartmall.common.api;
public enum ResultCode {
    SUCCESS(0, "success"),
    // generic
    SYSTEM_ERROR(10000, "系统繁忙，请稍后再试"),
    PARAM_INVALID(10001, "参数校验失败"),
    NOT_FOUND(10002, "资源不存在"),
    // auth 2xxxx
    UNAUTHORIZED(20001, "请先登录"),
    TOKEN_INVALID(20002, "Token 无效或已过期"),
    LOGIN_FAILED(20003, "用户名或密码错误"),
    // system 3xxxx
    SYS_USER_NOT_FOUND(30001, "用户不存在"),
    SYS_USER_NAME_DUPLICATE(30002, "用户名已存在"),
    CAPTCHA_INVALID(20004, "验证码错误或已过期"),
    // catalog 4xxxx
    CATEGORY_NOT_FOUND(40001, "分类不存在"),
    CATEGORY_NAME_DUPLICATE(40002, "同级分类名称已存在"),
    CATEGORY_HAS_CHILDREN(40003, "存在子分类，无法删除"),
    CATEGORY_PARENT_INVALID(40004, "父级分类不存在或不可用"),
    BRAND_NOT_FOUND(40101, "品牌不存在"),
    BRAND_NAME_DUPLICATE(40102, "品牌名称已存在"),
    ATTR_NOT_FOUND(40201, "属性不存在"),
    ATTR_GROUP_NOT_FOUND(40202, "属性分组不存在"),
    SPU_NOT_FOUND(40301, "商品不存在"),
    SKU_NOT_FOUND(40302, "SKU不存在"),
    // inventory 5xxxx
    STOCK_NOT_FOUND(50001, "库存记录不存在"),
    STOCK_INSUFFICIENT(50002, "库存不足"),
    // order 6xxxx
    ORDER_NOT_FOUND(60001, "订单不存在");

    private final int code; private final String message;
    ResultCode(int code, String message){ this.code=code; this.message=message; }
    public int getCode(){ return code; } public String getMessage(){ return message; }
}