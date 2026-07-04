import { httpGet, httpPost, httpPut, httpDelete } from "./http";
export const sysUserApi = {
    list: () => httpGet("/system/users"),
    get: (id) => httpGet(`/system/users/${id}`),
    create: (req) => httpPost("/system/users", req),
    update: (id, req) => httpPut(`/system/users/${id}`, req),
    remove: (id) => httpDelete(`/system/users/${id}`),
};
