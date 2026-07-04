import { selectionApi } from "@/api";
import type { CrawlerTaskDTO } from "@/api";

export async function watchCrawlerStatus(taskId: string, onUpdate: (task: CrawlerTaskDTO) => void): Promise<CrawlerTaskDTO> {
  let latest = await selectionApi.crawlerStatus(taskId);
  onUpdate(latest);
  for (let i = 0; i < 12 && latest.status !== "SUCCESS" && latest.status !== "FAILED"; i++) {
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    latest = await selectionApi.crawlerStatus(taskId);
    onUpdate(latest);
  }
  return latest;
}
