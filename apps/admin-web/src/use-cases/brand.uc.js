import { brandApi } from "@/api";
export const loadBrands = () => brandApi.list();
export const saveBrand = (b) => (b.id ? brandApi.update(b.id, b) : brandApi.create(b));
export const deleteBrand = (id) => brandApi.remove(id);
