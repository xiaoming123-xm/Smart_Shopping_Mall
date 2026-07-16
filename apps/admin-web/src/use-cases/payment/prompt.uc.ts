import { aiPromptApi } from "@/api";
import type { AiPromptDTO, SaveAiPromptRequest } from "@/api";

export const loadPrompts = (): Promise<AiPromptDTO[]> => aiPromptApi.list();
export const createPrompt = (req: SaveAiPromptRequest): Promise<AiPromptDTO> => aiPromptApi.create(req);
export const updatePrompt = (code: string, req: SaveAiPromptRequest): Promise<AiPromptDTO> => aiPromptApi.update(code, req);
export const deletePrompt = (code: string): Promise<void> => aiPromptApi.remove(code);

export const loadShoppingGuidePrompt = (): Promise<AiPromptDTO> => aiPromptApi.getShoppingGuide();
export const saveShoppingGuidePrompt = (req: SaveAiPromptRequest): Promise<AiPromptDTO> => aiPromptApi.saveShoppingGuide(req);
