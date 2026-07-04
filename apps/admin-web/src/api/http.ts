import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

// 鍚庣缁熶竴鍝嶅簲浣?R<T>锛堜笌 mall-common 鐨?com.smartmall.common.api.R 瀵归綈锛?
export interface ApiResult<T = unknown> {
  code: number;
  message: string;
  data: T;
  traceId?: string;
  success: boolean;
}

export interface PageResult<T = unknown> {
  total: number;
  list: T[];
}

// 涓氬姟閿欒锛坈ode 闈?0锛?
export class ApiError extends Error {
  code: number;
  traceId?: string;
  constructor(code: number, message: string, traceId?: string) {
    super(traceId ? `${message} (traceId=${traceId})` : message);
    this.code = code;
    this.traceId = traceId;
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

// 璺敱璺宠浆鍥炶皟锛堢敱 main.ts 娉ㄥ叆锛岄伩鍏?api 灞傜洿渚濊禆 router锛?
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

const instance: AxiosInstance = axios.create({
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
  if (!existing && typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    config.headers = config.headers || {};
    config.headers["X-Trace-Id"] = (crypto as any).randomUUID().replace(/-/g, "");
  }
  return config;
});

// 鍝嶅簲鎷︽埅锛氭媶鍖?R<T>锛宑ode鈮? 鎶ラ敊锛?0001/20002 娓?token 璺崇櫥褰?
instance.interceptors.response.use(
  (resp) => {
    const body = resp.data as ApiResult;
    const traceId = (resp.headers?.["x-trace-id"] as string | undefined) || body?.traceId;
    if (body && typeof body.code === "number") {
      if (body.code === 0) {
        return body.data as unknown as never;
      }
      // 鏈櫥褰?/ token 澶辨晥
      if (body.code === 20001 || body.code === 20002) {
        clearToken();
        if (onUnauthorized) onUnauthorized();
      }
      // 鎵撳嵃閿欒涓庣敤浜庤皟璇婄殑 traceId
      if (typeof console !== "undefined") {
        console.warn(`[API] code=${body.code} traceId=${traceId} msg=${body.message}`);
      }
      return Promise.reject(new ApiError(body.code, body.message || "璇锋眰澶辫触", traceId));
    }
    return resp.data as unknown as never;
  },
  (err) => {
    const status = err?.response?.status;
    const traceId = err?.response?.headers?.["x-trace-id"] as string | undefined;
    const msg = status ? `缃戠粶閿欒 ${status}` : "缃戠粶杩炴帴澶辫触锛岃妫€鏌ュ悗绔湇鍔?";
    if (typeof console !== "undefined") {
      console.warn(`[API] httpErr status=${status} traceId=${traceId}`);
    }
    return Promise.reject(new ApiError(status ?? -1, msg, traceId));
  }
);

// 娉涘瀷鍖呰锛氳繑鍥炲€煎凡鏄媶鍖呭悗鐨?data
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
