import { brandApi } from "@/api";
import type { BrandDTO } from "@/api";

export const loadBrands = (): Promise<BrandDTO[]> => brandApi.list();
export const saveBrand = (b: BrandDTO): Promise<BrandDTO> => (b.id ? brandApi.update(b.id, b) : brandApi.create(b));
export const deleteBrand = (id: number): Promise<void> => brandApi.remove(id);
