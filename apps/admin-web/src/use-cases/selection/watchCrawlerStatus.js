import { selectionApi } from "@/api";
export async function watchCrawlerStatus(taskId, onUpdate) {
    let latest = await selectionApi.crawlerStatus(taskId);
    onUpdate(latest);
    for (let i = 0; i < 12 && latest.status !== "SUCCESS" && latest.status !== "FAILED"; i++) {
        await new Promise((resolve) => window.setTimeout(resolve, 800));
        latest = await selectionApi.crawlerStatus(taskId);
        onUpdate(latest);
    }
    return latest;
}
