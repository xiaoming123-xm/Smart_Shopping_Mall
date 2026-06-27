import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

// 后端统一响应体 R<T>（与 mall-common 的 com.smartmall.common.api.R 对齐）
export interface ApiResult<T = unknown> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

export interface PageResult<T = unknown> {
  total: number;
  list: T[];
}

// 业务错误（code 非 0）
export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

const TOKEN_KEY = "sm_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// 路由跳转回调（由 main.ts 注入，避免 api 层直依赖 router）
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

const instance: AxiosInstance = axios.create({
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
instance.interceptors.response.use(
  (resp) => {
    const body = resp.data as ApiResult;
    if (body && typeof body.code === "number") {
      if (body.code === 0) {
        return body.data as unknown as never;
      }
      // 未登录 / token 失效
      if (body.code === 20001 || body.code === 20002) {
        clearToken();
        if (onUnauthorized) onUnauthorized();
      }
      return Promise.reject(new ApiError(body.code, body.message || "请求失败"));
    }
    return resp.data as unknown as never;
  },
  (err) => {
    const msg = err?.response?.status
      ? `网络错误 ${err.response.status}`
      : "网络连接失败，请检查后端服务";
    return Promise.reject(new ApiError(-1, msg));
  }
);

// 泛型包装：返回值已是拆包后的 data
export function httpGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  return instance.get(url, { params }) as unknown as Promise<T>;
}
export function httpPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return instance.post(url, data, config) as unknown as Promise<T>;
}
export function httpPut<T>(url: string, data?: unknown): Promise<T> {
  return instance.put(url, data) as unknown as Promise<T>;
}
export function httpDelete<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  return instance.delete(url, { params }) as unknown as Promise<T>;
}

export default instance;
