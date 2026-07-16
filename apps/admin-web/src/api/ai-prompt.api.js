import { httpDelete, httpGet, httpPost, httpPut } from "./http";
export const aiPromptApi = {
    list: () => httpGet("/ai/prompts"),
    get: (code) => httpGet(`/ai/prompts/${code}`),
    create: (req) => httpPost("/ai/prompts", req),
    update: (code, req) => httpPut(`/ai/prompts/${code}`, req),
    remove: (code) => httpDelete(`/ai/prompts/${code}`),
    getShoppingGuide: () => httpGet("/ai/prompts/shopping-guide"),
    saveShoppingGuide: (req) => httpPut("/ai/prompts/shopping-guide", req),
};
