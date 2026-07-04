import { httpGet, httpPost } from "./http";
import type { CrawlerTaskDTO, SelectionCategoryDTO, SelectionProductDTO, StartSelectionCrawlerRequest } from "./types";

export const selectionApi = {
  categories: () => httpGet<SelectionCategoryDTO[]>("/selection/categories"),
  products: (params?: { category_id?: number; sort?: string; order?: string }) =>
    httpGet<SelectionProductDTO[]>("/selection/products", params),
  startCrawler: (req?: StartSelectionCrawlerRequest) => httpPost<CrawlerTaskDTO>("/crawler/start-selection", req || {}),
  crawlerStatus: (taskId: string) => httpGet<CrawlerTaskDTO>(`/crawler/status/${taskId}`),
};
