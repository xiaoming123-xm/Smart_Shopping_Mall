export interface ApiResult<T = unknown> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`/api${url}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const body = (await resp.json()) as ApiResult<T>;
  if (typeof body.code === "number") {
    if (body.code === 0) return body.data;
    throw new Error(body.message || "request failed");
  }
  return body as unknown as T;
}

export function httpGet<T>(url: string): Promise<T> {
  return request<T>(url);
}

export function httpPost<T>(url: string, data?: unknown): Promise<T> {
  return request<T>(url, { method: "POST", body: JSON.stringify(data ?? {}) });
}
