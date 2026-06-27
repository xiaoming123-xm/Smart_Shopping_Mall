import { httpGet, httpPost, httpPut, httpDelete } from "./http";
export const categoryApi = {
    tree: () => httpGet("/catalog/categories/tree"),
    listByParent: (parentId) => httpGet("/catalog/categories", parentId != null ? { parentId } : undefined),
    get: (id) => httpGet(`/catalog/categories/${id}`),
    create: (req) => httpPost("/catalog/categories", req),
    update: (id, req) => httpPut(`/catalog/categories/${id}`, req),
    remove: (id) => httpDelete(`/catalog/categories/${id}`),
};
export const brandApi = {
    list: () => httpGet("/catalog/brands"),
    get: (id) => httpGet(`/catalog/brands/${id}`),
    create: (req) => httpPost("/catalog/brands", req),
    update: (id, req) => httpPut(`/catalog/brands/${id}`, req),
    remove: (id) => httpDelete(`/catalog/brands/${id}`),
};
export const attributeApi = {
    list: () => httpGet("/catalog/attributes"),
    get: (id) => httpGet(`/catalog/attributes/${id}`),
    create: (req) => httpPost("/catalog/attributes", req),
    update: (id, req) => httpPut(`/catalog/attributes/${id}`, req),
    remove: (id) => httpDelete(`/catalog/attributes/${id}`),
    addValue: (attrId, value, sort) => httpPost(`/catalog/attributes/${attrId}/values`, { value, sort }),
    removeValue: (valId) => httpDelete(`/catalog/attributes/values/${valId}`),
};
export const productApi = {
    list: () => httpGet("/catalog/products"),
    get: (id) => httpGet(`/catalog/products/${id}`),
    create: (req) => httpPost("/catalog/products", req),
    update: (id, req) => httpPut(`/catalog/products/${id}`, req),
    remove: (id) => httpDelete(`/catalog/products/${id}`),
    changeStatus: (id, status) => httpPut(`/catalog/products/${id}/status`, { status }),
    listSkus: (spuId) => httpGet(`/catalog/products/${spuId}/skus`),
    addSku: (spuId, req) => httpPost(`/catalog/products/${spuId}/skus`, req),
    updateSku: (skuId, req) => httpPut(`/catalog/products/skus/${skuId}`, req),
    removeSku: (skuId) => httpDelete(`/catalog/products/skus/${skuId}`),
};
