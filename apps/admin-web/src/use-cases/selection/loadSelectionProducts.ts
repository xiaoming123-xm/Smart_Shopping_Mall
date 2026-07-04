import { selectionApi } from "@/api";
import type { SelectionProductDTO } from "@/api";

export const loadSelectionProducts = (params: { categoryId?: number; sort?: string; order?: string }): Promise<SelectionProductDTO[]> =>
  selectionApi.products({ category_id: params.categoryId, sort: params.sort || "sales", order: params.order || "desc" });
