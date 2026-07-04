import { categoryApi } from "@/api";
import type { CategoryTreeDTO, CategoryDTO, CreateCategoryRequest, UpdateCategoryRequest } from "@/api";

export const loadCategoryTree = (): Promise<CategoryTreeDTO[]> => categoryApi.tree();
export const createCategory = (req: CreateCategoryRequest): Promise<CategoryDTO> => categoryApi.create(req);
export const updateCategory = (id: number, req: UpdateCategoryRequest): Promise<CategoryDTO> => categoryApi.update(id, req);
export const deleteCategory = (id: number): Promise<void> => categoryApi.remove(id);
