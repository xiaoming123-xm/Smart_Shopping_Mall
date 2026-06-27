import { categoryApi } from "@/api";
export const loadCategoryTree = () => categoryApi.tree();
export const createCategory = (req) => categoryApi.create(req);
export const updateCategory = (id, req) => categoryApi.update(id, req);
export const deleteCategory = (id) => categoryApi.remove(id);
