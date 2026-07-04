import { productApi } from "@/api";
export const loadProducts = () => productApi.list();
export const loadProduct = (id) => productApi.get(id);
export const saveProduct = (p) => (p.id ? productApi.update(p.id, p) : productApi.create(p));
export const deleteProduct = (id) => productApi.remove(id);
// 上架/下架：status 1=上架 0=下架
export const toggleProductStatus = (id, online) => productApi.changeStatus(id, online ? 1 : 0);
export const loadSkus = (spuId) => productApi.listSkus(spuId);
export const saveSku = (spuId, sku) => (sku.id ? productApi.updateSku(sku.id, sku) : productApi.addSku(spuId, sku));
export const deleteSku = (skuId) => productApi.removeSku(skuId);
