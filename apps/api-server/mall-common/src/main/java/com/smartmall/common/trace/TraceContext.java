package com.smartmall.common.trace;

/**
 * 璇锋眰璺熻釜 ID 涓婁笅鏂囥€?* 鐢变簬鍚庣骞跺彂璇锋眰锛屾棩蹇椾腑闇€瑕佸叿澶囧敮涓€鏍囪瘑灏嗗悓涓€涓姹傜殑鏃ュ織涓茶亸璧锋潵銆?* 杩欓噷閲囩敤 ThreadLocal 瀛樺偍 traceId锛岀敱 TraceIdFilter 鍦ㄨ姹傚叆鍙ｅ拰鍑哄彛缁熶竴璧嬪€笺€佹竻闄ゃ€?*/
public final class TraceContext {

    public static final String HEADER = "X-Trace-Id";
    public static final String MDC_KEY = "traceId";

    private static final ThreadLocal<String> CURRENT = new ThreadLocal<>();

    private TraceContext() {
    }

    public static void set(String traceId) {
        CURRENT.set(traceId);
        if (traceId != null) {
            org.slf4j.MDC.put(MDC_KEY, traceId);
        } else {
            org.slf4j.MDC.remove(MDC_KEY);
        }
    }

    public static String get() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
        org.slf4j.MDC.remove(MDC_KEY);
    }
}
