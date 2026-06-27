import { httpGet, httpPost } from "./http";
export const inventoryApi = {
    list: () => httpGet("/inventory/stocks"),
    getBySku: (skuId) => httpGet(`/inventory/stocks/sku/${skuId}`),
    stockIn: (skuId, qty, remark) => httpPost("/inventory/stocks/in", { skuId, qty, remark }),
    stockOut: (skuId, qty, remark) => httpPost("/inventory/stocks/out", { skuId, qty, remark }),
    records: (skuId) => httpGet(`/inventory/stocks/sku/${skuId}/records`),
};
