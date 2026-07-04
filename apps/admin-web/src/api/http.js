import axios from "axios";
// 涓氬姟閿欒锛坈ode 闈?0锛?
export class ApiError extends Error {
    constructor(code, message, traceId) {
        super(traceId ? `${message} (traceId=${traceId})` : message);
        this.code = code;
        this.traceId = traceId;
        this.name = "ApiError";
    }
}
const TOKEN_KEY = "sm_token";
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}
// 璺敱璺宠浆鍥炶皟锛堢敱 main.ts 娉ㄥ叆锛岄伩鍏?api 灞傜洿渚濊禆 router锛?
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
    onUnauthorized = fn;
}
const instance = axios.create({
    baseURL: "/api",
    timeout: 15000,
});
// 璇锋眰鎷︽埅锛氭敞鍏?Bearer token + 閫忎紶 traceId
instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    // 如果页面已生成 traceId，透传到后端方便排查。
    const existing = (config.headers || {})["X-Trace-Id"];
    if (!existing && typeof crypto !== "undefined" && crypto.randomUUID) {
        config.headers = config.headers || {};
        config.headers["X-Trace-Id"] = crypto.randomUUID().replace(/-/g, "");
    }
    return config;
});
// 鍝嶅簲鎷︽埅锛氭媶鍖?R<T>锛宑ode鈮? 鎶ラ敊锛?0001/20002 娓?token 璺崇櫥褰?
instance.interceptors.response.use((resp) => {
    const body = resp.data;
    const traceId = resp.headers?.["x-trace-id"] || body?.traceId;
    if (body && typeof body.code === "number") {
        if (body.code === 0) {
            return body.data;
        }
        // 鏈櫥褰?/ token 澶辨晥
        if (body.code === 20001 || body.code === 20002) {
            clearToken();
            if (onUnauthorized)
                onUnauthorized();
        }
        // 鎵撳嵃閿欒涓庣敤浜庤皟璇婄殑 traceId
        if (typeof console !== "undefined") {
            console.warn(`[API] code=${body.code} traceId=${traceId} msg=${body.message}`);
        }
        return Promise.reject(new ApiError(body.code, body.message || "璇锋眰澶辫触", traceId));
    }
    return resp.data;
}, (err) => {
    const status = err?.response?.status;
    const traceId = err?.response?.headers?.["x-trace-id"];
    const msg = status ? `缃戠粶閿欒 ${status}` : "缃戠粶杩炴帴澶辫触锛岃妫€鏌ュ悗绔湇鍔?";
    if (typeof console !== "undefined") {
        console.warn(`[API] httpErr status=${status} traceId=${traceId}`);
    }
    return Promise.reject(new ApiError(status ?? -1, msg, traceId));
});
// 娉涘瀷鍖呰锛氳繑鍥炲€煎凡鏄媶鍖呭悗鐨?data
export function httpGet(url, params) {
    return instance.get(url, { params });
}
export function httpPost(url, data, config) {
    return instance.post(url, data, config);
}
export function httpPut(url, data) {
    return instance.put(url, data);
}
export function httpDelete(url, params) {
    return instance.delete(url, { params });
}
export default instance;
