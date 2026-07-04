import { selectionApi } from "@/api";
import type { CrawlerTaskDTO, StartSelectionCrawlerRequest } from "@/api";

export const startSelectionCrawler = (req?: StartSelectionCrawlerRequest): Promise<CrawlerTaskDTO> => selectionApi.startCrawler(req);
