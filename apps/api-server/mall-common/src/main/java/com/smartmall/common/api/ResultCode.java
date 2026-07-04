package com.smartmall.common.api;
public enum ResultCode {
    SUCCESS(0, "success"),
    // generic
    SYSTEM_ERROR(10000, "绯荤粺绻佸繖锛岃绋嶅悗鍐嶈瘯"),
    PARAM_INVALID(10001, "鍙傛暟鏍￠獙澶辫触"),
    NOT_FOUND(10002, "璧勬簮涓嶅瓨鍦?"),
    // auth 2xxxx
    UNAUTHORIZED(20001, "璇峰厛鐧诲綍"),
    TOKEN_INVALID(20002, "Token 鏃犳晥鎴栧凡杩囨湡"),
    LOGIN_FAILED(20003, "鐢ㄦ埛鍚嶆垨瀵嗙爜閿欒"),
    CAPTCHA_INVALID(20004, "楠岃瘉鐮侀敊璇垨宸茶繃鏈?"),
    // system 3xxxx
    SYS_USER_NOT_FOUND(30001, "鐢ㄦ埛涓嶅瓨鍦?"),
    SYS_USER_NAME_DUPLICATE(30002, "鐢ㄦ埛鍚嶅凡瀛樺湪"),
    // catalog 4xxxx
    CATEGORY_NOT_FOUND(40001, "鍒嗙被涓嶅瓨鍦?"),
    CATEGORY_NAME_DUPLICATE(40002, "鍚岀骇鍒嗙被鍚嶇О宸插瓨鍦?"),
    CATEGORY_HAS_CHILDREN(40003, "瀛樺湪瀛愬垎绫伙紝鏃犳硶鍒犻櫎"),
    CATEGORY_PARENT_INVALID(40004, "鐖剁骇鍒嗙被涓嶅瓨鍦ㄦ垨涓嶅彲鐢?"),
    BRAND_NOT_FOUND(40101, "鍝佺墝涓嶅瓨鍦?"),
    BRAND_NAME_DUPLICATE(40102, "鍝佺墝鍚嶇О宸插瓨鍦?"),
    ATTR_NOT_FOUND(40201, "灞炴€т笉瀛樺湪"),
    ATTR_GROUP_NOT_FOUND(40202, "灞炴€у垪缁勪笉瀛樺湪"),
    SPU_NOT_FOUND(40301, "鍟嗗搧涓嶅瓨鍦?"),
    SKU_NOT_FOUND(40302, "SKU涓嶅瓨鍦?"),
    // inventory 5xxxx
    STOCK_NOT_FOUND(50001, "搴撳瓨璁板綍涓嶅瓨鍦?"),
    STOCK_INSUFFICIENT(50002, "搴撳瓨涓嶈冻"),
    // order 6xxxx
    ORDER_NOT_FOUND(60001, "璁㈠崟涓嶅瓨鍦?"),
    ORDER_STATE_INVALID(60002, "璁㈠崟鐘舵€佷笉鍏佽璇ユ搷浣?"),
    ORDER_ITEMS_EMPTY(60003, "璁㈠崟鍟嗗搧涓嶈兘涓虹┖"),
    // payment 7xxxx
    PAYMENT_NOT_FOUND(70001, "鏀粯鍗曚笉瀛樺湪"),
    PAYMENT_STATE_INVALID(70002, "鏀粯鍗曠姸鎬佷笉鍏佽璇ユ搷浣?"),
    PAYMENT_AMOUNT_INVALID(70003, "鏀粯閲戦闈炴硶"),
    REFUND_NOT_ALLOWED(70004, "褰撳墠鐘舵€佷笉鍏佽閫€娆?"),
    // ai 8xxxx
    AI_PROVIDER_UNAVAILABLE(80001, "AI 鏈嶅姟鏆備笉鍙敤"),
    AI_BAD_REQUEST(80002, "AI 璇锋眰鍙傛暟涓嶅悎娉?"),
    AI_TIMEOUT(80003, "AI 璋冪敤瓒呮椂"),
    // content 9xxxx
    CONTENT_NOT_FOUND(90001, "鍐呭涓嶅瓨鍦?"),
    CONTENT_OFFLINE(90002, "鍐呭宸蹭笅绾?"),
    // member 10xxxx
    MEMBER_NOT_FOUND(100001, "浼氬憳涓嶅瓨鍦?"),
    MEMBER_DISABLED(100002, "浼氬憳宸茬鐢?"),
    MEMBER_ADDRESS_NOT_FOUND(100003, "鏀惰揣鍦板潃涓嶅瓨鍦?"),
    // search 11xxxx
    SEARCH_INDEX_UNAVAILABLE(110001, "鎼滅储绱㈠紩涓嶅彲鐢?"),
    // selection 12xxxx
    SELECTION_CATEGORY_NOT_FOUND(120001, "选品分类不存在"),
    CRAWLER_TASK_ALREADY_RUNNING(120002, "选品抓取任务正在运行"),
    CRAWLER_TASK_NOT_FOUND(120003, "选品抓取任务不存在"),
    // ai content 13xxxx
    AI_CONTENT_TASK_NOT_FOUND(130001, "AI 生成任务不存在"),
    AI_CONTENT_ASSET_INVALID(130002, "AI 生成资源无效");
    private final int code; private final String message;
    ResultCode(int code, String message){ this.code=code; this.message=message; }
    public int getCode(){ return code; } public String getMessage(){ return message; }
}
