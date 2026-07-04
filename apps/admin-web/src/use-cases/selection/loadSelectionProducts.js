import { selectionApi } from "@/api";
export const loadSelectionProducts = (params) => selectionApi.products({ category_id: params.categoryId, sort: params.sort || "sales", order: params.order || "desc" });
