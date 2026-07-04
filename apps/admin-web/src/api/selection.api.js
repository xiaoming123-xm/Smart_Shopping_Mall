import { httpGet, httpPost } from "./http";
export const selectionApi = {
    categories: () => httpGet("/selection/categories"),
    products: (params) => httpGet("/selection/products", params),
    startCrawler: (req) => httpPost("/crawler/start-selection", req || {}),
    crawlerStatus: (taskId) => httpGet(`/crawler/status/${taskId}`),
};
