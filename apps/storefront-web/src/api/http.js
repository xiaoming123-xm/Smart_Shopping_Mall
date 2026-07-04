async function request(url, options) {
    const resp = await fetch(`/api${url}`, {
        headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
        ...options,
    });
    if (!resp.ok)
        throw new Error(`HTTP ${resp.status}`);
    const body = (await resp.json());
    if (typeof body.code === "number") {
        if (body.code === 0)
            return body.data;
        throw new Error(body.message || "request failed");
    }
    return body;
}
export function httpGet(url) {
    return request(url);
}
export function httpPost(url, data) {
    return request(url, { method: "POST", body: JSON.stringify(data ?? {}) });
}
