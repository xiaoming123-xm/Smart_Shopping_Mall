import { inventoryApi } from "@/api";
import type { StockDTO, StockRecordDTO } from "@/api";

export const loadStocks = (): Promise<StockDTO[]> => inventoryApi.list();
export const stockIn = (skuId: number, qty: number, remark?: string): Promise<StockDTO> => inventoryApi.stockIn(skuId, qty, remark);
export const stockOut = (skuId: number, qty: number, remark?: string): Promise<StockDTO> => inventoryApi.stockOut(skuId, qty, remark);
export const loadStockRecords = (skuId: number): Promise<StockRecordDTO[]> => inventoryApi.records(skuId);
