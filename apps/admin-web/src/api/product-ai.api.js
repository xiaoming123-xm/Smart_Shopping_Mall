import { httpGet, httpPost } from "./http";
export const productAiApi = {
    generateImage: (req) => httpPost("/ai/generate-image", req),
    replaceMainImage: (req) => httpPost("/ai/replace-main-image", req),
    generateVideo: (req) => httpPost("/ai/generate-video", req),
    taskStatus: (taskId) => httpGet(`/ai/task-status/${taskId}`),
};
