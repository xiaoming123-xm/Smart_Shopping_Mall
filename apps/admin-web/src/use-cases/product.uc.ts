import { productApi } from "@/api";
import type { SpuDTO, SkuDTO } from "@/api";

export const loadProducts = (): Promise<SpuDTO[]> => productApi.list();
export const loadProduct = (id: number): Promise<SpuDTO> => productApi.get(id);
export const saveProduct = (p: SpuDTO): Promise<SpuDTO> => (p.id ? productApi.update(p.id, p) : productApi.create(p));
export const deleteProduct = (id: number): Promise<void> => productApi.remove(id);
// 上架/下架：status 1=上架 0=下架
export const toggleProductStatus = (id: number, online: boolean): Promise<SpuDTO> => productApi.changeStatus(id, online ? 1 : 0);
export const loadSkus = (spuId: number): Promise<SkuDTO[]> => productApi.listSkus(spuId);
export const saveSku = (spuId: number, sku: SkuDTO): Promise<SkuDTO> => (sku.id ? productApi.updateSku(sku.id, sku) : productApi.addSku(spuId, sku));
export const deleteSku = (skuId: number): Promise<void> => productApi.removeSku(skuId);
