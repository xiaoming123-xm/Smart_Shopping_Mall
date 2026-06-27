import { inventoryApi } from "@/api";
export const loadStocks = () => inventoryApi.list();
export const stockIn = (skuId, qty, remark) => inventoryApi.stockIn(skuId, qty, remark);
export const stockOut = (skuId, qty, remark) => inventoryApi.stockOut(skuId, qty, remark);
export const loadStockRecords = (skuId) => inventoryApi.records(skuId);
