import { selectionApi } from "@/api";
import type { SelectionCategoryDTO } from "@/api";

export const loadSelectionCategories = (): Promise<SelectionCategoryDTO[]> => selectionApi.categories();
