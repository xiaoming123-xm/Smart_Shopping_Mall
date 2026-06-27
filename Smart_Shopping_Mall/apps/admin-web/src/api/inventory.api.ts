import { httpGet, httpPost } from "./http";
import type { StockDTO, StockRecordDTO } from "./types";

export const inventoryApi = {
  list: () => httpGet<StockDTO[]>("/inventory/stocks"),
  getBySku: (skuId: number) => httpGet<StockDTO>(`/inventory/stocks/sku/${skuId}`),
  stockIn: (skuId: number, qty: number, remark?: string) => httpPost<StockDTO>("/inventory/stocks/in", { skuId, qty, remark }),
  stockOut: (skuId: number, qty: number, remark?: string) => httpPost<StockDTO>("/inventory/stocks/out", { skuId, qty, remark }),
  records: (skuId: number) => httpGet<StockRecordDTO[]>(`/inventory/stocks/sku/${skuId}/records`),
};
