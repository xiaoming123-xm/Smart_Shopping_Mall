import axios from "axios";
// 业务错误（code 非 0）
export class ApiError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
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
// 路由跳转回调（由 main.ts 注入，避免 api 层直依赖 router）
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
    onUnauthorized = fn;
}
const instance = axios.create({
    baseURL: "/api",
    timeout: 15000,
});
// 请求拦截：注入 Bearer token
instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// 响应拦截：拆包 R<T>，code≠0 报错，20001/20002 清 token 跳登录
instance.interceptors.response.use((resp) => {
    const body = resp.data;
    if (body && typeof body.code === "number") {
        if (body.code === 0) {
            return body.data;
        }
        // 未登录 / token 失效
        if (body.code === 20001 || body.code === 20002) {
            clearToken();
            if (onUnauthorized)
                onUnauthorized();
        }
        return Promise.reject(new ApiError(body.code, body.message || "请求失败"));
    }
    return resp.data;
}, (err) => {
    const msg = err?.response?.status
        ? `网络错误 ${err.response.status}`
        : "网络连接失败，请检查后端服务";
    return Promise.reject(new ApiError(-1, msg));
});
// 泛型包装：返回值已是拆包后的 data
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
