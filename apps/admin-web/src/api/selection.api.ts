import { httpGet, httpPost } from "./http";
import type { CrawlerTaskDTO, PddCrawlerSessionDTO, SelectionCategoryDTO, SelectionProductDTO, StartSelectionCrawlerRequest } from "./types";

export const selectionApi = {
  categories: () => httpGet<SelectionCategoryDTO[]>("/selection/categories"),
  products: (params?: { category_id?: number; sort?: string; order?: string }) =>
    httpGet<SelectionProductDTO[]>("/selection/products", params),
  pddSession: () => httpGet<PddCrawlerSessionDTO>("/crawler/pdd-session"),
  openPddLogin: () => httpPost<PddCrawlerSessionDTO>("/crawler/pdd-session/open-login", {}),
  confirmPddLogin: () => httpPost<PddCrawlerSessionDTO>("/crawler/pdd-session/confirm", {}),
  clearPddSession: () => httpPost<PddCrawlerSessionDTO>("/crawler/pdd-session/clear", {}),
  startCrawler: (req?: StartSelectionCrawlerRequest) => httpPost<CrawlerTaskDTO>("/crawler/start-selection", req || {}),
  crawlerStatus: (taskId: string) => httpGet<CrawlerTaskDTO>(`/crawler/status/${taskId}`),
};
