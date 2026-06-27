import { httpGet, httpPost, httpPut, httpDelete } from "./http";
import type {
  CategoryDTO, CategoryTreeDTO, CreateCategoryRequest, UpdateCategoryRequest,
  BrandDTO, AttributeDTO, AttributeValue, SpuDTO, SkuDTO,
} from "./types";

export const categoryApi = {
  tree: () => httpGet<CategoryTreeDTO[]>("/catalog/categories/tree"),
  listByParent: (parentId?: number) => httpGet<CategoryDTO[]>("/catalog/categories", parentId != null ? { parentId } : undefined),
  get: (id: number) => httpGet<CategoryDTO>(`/catalog/categories/${id}`),
  create: (req: CreateCategoryRequest) => httpPost<CategoryDTO>("/catalog/categories", req),
  update: (id: number, req: UpdateCategoryRequest) => httpPut<CategoryDTO>(`/catalog/categories/${id}`, req),
  remove: (id: number) => httpDelete<void>(`/catalog/categories/${id}`),
};

export const brandApi = {
  list: () => httpGet<BrandDTO[]>("/catalog/brands"),
  get: (id: number) => httpGet<BrandDTO>(`/catalog/brands/${id}`),
  create: (req: BrandDTO) => httpPost<BrandDTO>("/catalog/brands", req),
  update: (id: number, req: BrandDTO) => httpPut<BrandDTO>(`/catalog/brands/${id}`, req),
  remove: (id: number) => httpDelete<void>(`/catalog/brands/${id}`),
};

export const attributeApi = {
  list: () => httpGet<AttributeDTO[]>("/catalog/attributes"),
  get: (id: number) => httpGet<AttributeDTO>(`/catalog/attributes/${id}`),
  create: (req: AttributeDTO) => httpPost<AttributeDTO>("/catalog/attributes", req),
  update: (id: number, req: AttributeDTO) => httpPut<AttributeDTO>(`/catalog/attributes/${id}`, req),
  remove: (id: number) => httpDelete<void>(`/catalog/attributes/${id}`),
  addValue: (attrId: number, value: string, sort?: number) => httpPost<AttributeValue>(`/catalog/attributes/${attrId}/values`, { value, sort }),
  removeValue: (valId: number) => httpDelete<void>(`/catalog/attributes/values/${valId}`),
};

export const productApi = {
  list: () => httpGet<SpuDTO[]>("/catalog/products"),
  get: (id: number) => httpGet<SpuDTO>(`/catalog/products/${id}`),
  create: (req: SpuDTO) => httpPost<SpuDTO>("/catalog/products", req),
  update: (id: number, req: SpuDTO) => httpPut<SpuDTO>(`/catalog/products/${id}`, req),
  remove: (id: number) => httpDelete<void>(`/catalog/products/${id}`),
  changeStatus: (id: number, status: number) => httpPut<SpuDTO>(`/catalog/products/${id}/status`, { status }),
  listSkus: (spuId: number) => httpGet<SkuDTO[]>(`/catalog/products/${spuId}/skus`),
  addSku: (spuId: number, req: SkuDTO) => httpPost<SkuDTO>(`/catalog/products/${spuId}/skus`, req),
  updateSku: (skuId: number, req: SkuDTO) => httpPut<SkuDTO>(`/catalog/products/skus/${skuId}`, req),
  removeSku: (skuId: number) => httpDelete<void>(`/catalog/products/skus/${skuId}`),
};
