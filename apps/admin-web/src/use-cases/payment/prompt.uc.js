import { aiPromptApi } from "@/api";
export const loadPrompts = () => aiPromptApi.list();
export const createPrompt = (req) => aiPromptApi.create(req);
export const updatePrompt = (code, req) => aiPromptApi.update(code, req);
export const deletePrompt = (code) => aiPromptApi.remove(code);
export const loadShoppingGuidePrompt = () => aiPromptApi.getShoppingGuide();
export const saveShoppingGuidePrompt = (req) => aiPromptApi.saveShoppingGuide(req);
