import { httpGet, httpPost } from "./http";
export const selectionApi = {
    categories: () => httpGet("/selection/categories"),
    products: (params) => httpGet("/selection/products", params),
    pddSession: () => httpGet("/crawler/pdd-session"),
    openPddLogin: () => httpPost("/crawler/pdd-session/open-login", {}),
    confirmPddLogin: () => httpPost("/crawler/pdd-session/confirm", {}),
    clearPddSession: () => httpPost("/crawler/pdd-session/clear", {}),
    startCrawler: (req) => httpPost("/crawler/start-selection", req || {}),
    crawlerStatus: (taskId) => httpGet(`/crawler/status/${taskId}`),
};
