import { httpDelete, httpGet, httpPost, httpPut } from "./http";
import type { AiPromptDTO, SaveAiPromptRequest } from "./types";

export const aiPromptApi = {
  list: () => httpGet<AiPromptDTO[]>("/ai/prompts"),
  get: (code: string) => httpGet<AiPromptDTO>(`/ai/prompts/${code}`),
  create: (req: SaveAiPromptRequest) => httpPost<AiPromptDTO>("/ai/prompts", req),
  update: (code: string, req: SaveAiPromptRequest) => httpPut<AiPromptDTO>(`/ai/prompts/${code}`, req),
  remove: (code: string) => httpDelete<void>(`/ai/prompts/${code}`),
  getShoppingGuide: () => httpGet<AiPromptDTO>("/ai/prompts/shopping-guide"),
  saveShoppingGuide: (req: SaveAiPromptRequest) => httpPut<AiPromptDTO>("/ai/prompts/shopping-guide", req),
};
